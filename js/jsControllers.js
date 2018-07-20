/*
 * In this file we define all of the possible controller classes for robots
 * which are encoded in regular Javascript.  The Blockly controller is in
 * blocklyController.js.  Javascript doesn't have interfaces so we are not
 * really enforcing this, but all controllers should have a getAction method as
 * follows:
 *
 *      getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) 
 *
 * The returned action object has this structure:
 * {
 *   linearSpeed: FORWARD_SPEED_NUMBER,
 *   angularSpeed: ANGULAR_SPEED_NUMBER,
 *   gripperOn: GRIPPER_BOOLEAN,
 *   flashOn: FLASH_BOOLEAN,
 *   emitPheromone: EMIT_BOOLEAN,
 *   textMessage: STRING
 * }
 */

//
// The following is useful for all controller classes.
//

function getZeroAction() {
    return {
        linearSpeed: 0,
        angularSpeed: 0,
        gripperOn: false,
        flashOn: false,
        emitPheromone: false,
        textMessage: ""
    };
}

function getForwardAction() {
    return {
        linearSpeed: myGlobals.MAX_FORWARD_SPEED,
        angularSpeed: 0,
        gripperOn: false,
        flashOn: false,
        emitPheromone: false,
        textMessage: ""
    };
}

// Used as a fundamental obstacle (robot/wall) avoidance behaviour.  Returns
// null if there is nothing to avoid.
function getObstacleAvoidanceAction(sensorReadings) {
    action = getZeroAction();

    var wallLeft = false;
    var wallRight = false;
    if (sensorReadings.leftObstacle.count > 0) {
        wallLeft = true;
    }
    if (sensorReadings.rightObstacle.count > 0) {
        wallRight = true;
    }
    if (wallLeft && wallRight) {
        action.linearSpeed = -myGlobals.MAX_FORWARD_SPEED;
        action.angularSpeed = 2*(0.5 - Math.random()) * myGlobals.MAX_ANGULAR_SPEED;
        return action;
    } else if (wallLeft) {
        action.linearSpeed = myGlobals.MAX_FORWARD_SPEED;
        action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        return action;
    } else if (wallRight) {
        action.linearSpeed = myGlobals.MAX_FORWARD_SPEED;
        action.angularSpeed = -myGlobals.MAX_ANGULAR_SPEED;
        return action;
    } 

    return null;
}

class TestController {
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        if (!this.startTimestamp) {
            this.startTimestamp = timestamp;
            console.log("SET START");
        }
        this.action = getZeroAction();

        var elapsed = timestamp - this.startTimestamp;
        console.log(elapsed);

        if (elapsed < 250) {
            this.action.linearSpeed = myGlobals.MAX_FORWARD_SPEED;
        } else if (elapsed < 340) {
            this.action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        } else if (elapsed < 550) {
            this.action.linearSpeed = myGlobals.MAX_FORWARD_SPEED;
        }

        return this.action;
    }
}

class SimpleAvoidController {
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getObstacleAvoidanceAction(sensorReadings);
        if (!action) {
            action = getForwardAction();
        }
        return action;
    }
}

class AdvancedClusterController {
    constructor() {
        this.state = "NORMAL";
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        if (this.state == "NORMAL") {
            this.inNormalState(timestamp, sensorReadings, redPuckHeld);
        } else {
            this.inBackUpState(timestamp, sensorReadings, redPuckHeld);
        }

        return this.action;
    }

    inNormalState(timestamp, sensorReadings, puckHeld) {
        var avoidance = true;
        this.action = getObstacleAvoidanceAction(sensorReadings);
        if (!this.action) {
            this.action = getForwardAction();
            avoidance = false;
        }

        // The default gripper state comes from whether we are already holding a puck or not.
        this.action.gripperOn = puckHeld;

        let lowDensityThreshold = 2;

        var innerPucks = sensorReadings.innerRedPuck.count;
        var leftPucks = sensorReadings.leftRedPuck.count;
        var rightPucks = sensorReadings.rightRedPuck.count;
        if (!puckHeld) {
            if (innerPucks == 1 && leftPucks <= 1 && rightPucks <=1 ) {
                this.action.gripperOn = true;

            // The following two conditions motivate this unladen robot to
            // avoid disturbing existing clusters.
            } else if (!avoidance && leftPucks > rightPucks && leftPucks > lowDensityThreshold) {
                // Turn away from this cluster.
                this.action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            } else if (!avoidance && rightPucks > leftPucks && rightPucks > lowDensityThreshold) {
                // Turn away from this cluster.
                this.action.angularSpeed = -myGlobals.MAX_ANGULAR_SPEED;

            // The following two conditions attract this unladen robot towards
            // potentially isolated pucks.
            } else if (!avoidance && leftPucks > rightPucks && 
                       (leftPucks >= 1 && leftPucks <= lowDensityThreshold)) {
                // Turn towards this (potentially) isolated puck.
                this.action.angularSpeed = -myGlobals.MAX_ANGULAR_SPEED;
            } else if (!avoidance && rightPucks > leftPucks && 
                       (rightPucks >= 1 && rightPucks <= lowDensityThreshold)) {
                // Turn towards this (potentially) isolated puck.
                this.action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;

            }

        } else {
            // Note that the held puck is not detected.
            if (innerPucks >= 1) {
                this.action.gripperOn = false;
                this.state = "BACK_UP";
                this.buStartTime = timestamp;
            }            
        }
    }

    inBackUpState(timestamp, sensorReadings, puckHeld) {
        var elapsed = timestamp - this.buStartTime;
        if (elapsed < 250) {
            this.action = getZeroAction();
            //this.action.linearSpeed = -myGlobals.MAX_FORWARD_SPEED;
            //this.action.angularSpeed = Math.random() * myGlobals.MAX_ANGULAR_SPEED;
            this.action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        } else {
            this.action = getForwardAction();
            this.state = "NORMAL";
        }
    }
}

class OrbitController {
    constructor() {
        this.threshold = 0.75;
    }

    /*
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftObstacle.count > 0) {
            action.linearSpeed = myGlobals.MAX_FORWARD_SPEED;
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;

        if (rightNest >= centreNest && centreNest >= leftNest) {
            if (centreNest >= 0.0001) {
                action.angularSpeed = - 0.3 * myGlobals.MAX_ANGULAR_SPEED;
            } else {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;                
            }
        } else if (centreNest >= rightNest && centreNest >= leftNest) {
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
        } else {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        }

        action.textMessage =  centreNest;

        return action;
    }
    */
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftObstacle.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;

        if (rightNest >= centreNest && centreNest >= leftNest) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                return action;
            } else {
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;                
                return action;
            }

        } else if (centreNest >= rightNest && centreNest >= leftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            return action;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        // SHOULDN'T REACH HERE.
        return null;
    }

}

class OrbitalConstructionController {
    constructor() {
        this.innie = Math.random() < 0.5;
        if (this.innie) {
            this.threshold = 0.75
        } else {
            this.threshold = 0.7
        }

        this.walkaboutCount = 0;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();
        if (this.innie) {
            action.flashOn = true; // To visually distinguish innies/outies
        }

        if (sensorReadings.leftObstacle.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;
        var leftPucks = sensorReadings.leftRedPuck.count;
        var rightPucks = sensorReadings.rightRedPuck.count;

        // Potentially go on "walkabout" to search for pucks.
        /*
        var walkaboutAction = this.getWalkaboutAction(action, sensorReadings);
        if (walkaboutAction != null) {
            return walkaboutAction;
        }
        */

        if (rightNest >= centreNest && centreNest >= leftNest) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // These conditions steer in (for an innie) and out (for an outie)
            // to nudge a puck inwards or outwards.
            if (this.innie && rightPucks > 0) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
                return action;
            } else if (!this.innie && leftPucks > 0) {
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
                return action;
            } 

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                return action;
            } else {
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;                
                return action;
            }

        } else if (centreNest >= rightNest && centreNest >= leftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            return action;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        // SHOULDN'T REACH HERE.
        return null;
    }

    // Check if the robot should go on "walkabout".  If so, return the
    // appropriate action.  Otherwise, return null.
    getWalkaboutAction(action, sensorReadings) {
        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;

        // Outies may randomly decide to go on "walkabout" for stray pucks.
        let walkabout = false;
        if (this.walkaboutCount > 0) {
            walkabout = true;
            this.walkaboutCount--;
        } else if (!this.innie && Math.random() < 0.01) {
            walkabout = true;
            this.walkaboutCount = Math.floor(50 * Math.random());
        }
        if (walkabout) {
            if (rightNest >= centreNest && rightNest >= leftNest) {
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            } else if (leftNest >= centreNest && leftNest >= rightNest) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            }
            action.textMessage = "W";
            return action;
        }

        return null;
    }
}

/* Like OrbitalConstruction above, but operating on two colours (red and green)
   with two separate thresholds.  The "walkabout" feature has also been removed.
*/
class OrbitalConstructionBiColourController {
    constructor() {
        let rand = Math.random();
        if (rand < 0.333) {
            this.textMessage = "GO";
            this.innie = false;
            this.puckType = ObjectTypes.GREEN_PUCK;
            this.threshold = 0.5;
        } else if (rand < 0.666) {
            this.textMessage = "GI";
            this.innie = true;
            this.puckType = ObjectTypes.GREEN_PUCK;
            this.threshold = 0.7;
        } else {
            this.textMessage = "RO";
            this.innie = false;
            this.puckType = ObjectTypes.RED_PUCK;
            this.threshold = 0.8;
        }
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();
        action.textMessage = this.textMessage;

        if (sensorReadings.leftObstacle.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;
        var leftPucks, rightPucks;
        if (this.puckType == ObjectTypes.RED_PUCK) {
            leftPucks = sensorReadings.leftRedPuck.count;
            rightPucks = sensorReadings.rightRedPuck.count;
        } else {
            leftPucks = sensorReadings.leftGreenPuck.count;
            rightPucks = sensorReadings.rightGreenPuck.count;
        }

        if (rightNest >= centreNest && centreNest >= leftNest) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // These conditions steer in (for an innie) and out (for an outie)
            // to nudge a puck inwards or outwards.
            if (this.innie && rightPucks > 0) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
                return action;
            } else if (!this.innie && leftPucks > 0) {
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
                return action;
            } 

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                return action;
            } else {
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;                
                return action;
            }

        } else if (centreNest >= rightNest && centreNest >= leftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            return action;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        // SHOULDN'T REACH HERE.
        return null;
    }
}
