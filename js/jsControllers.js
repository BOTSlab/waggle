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
 *   textMessage: STRING,
 *   textColour: STRING
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
        textMessage: "",
        textColour: "cyan"
    };
}

function getForwardAction() {
    return {
        linearSpeed: myGlobals.MAX_FORWARD_SPEED,
        angularSpeed: 0,
        gripperOn: false,
        flashOn: false,
        emitPheromone: false,
        textMessage: "",
        textColour: ""
    };
}

// Used as a fundamental obstacle (robot/wall) avoidance behaviour.  Returns
// null if there is nothing to avoid.
function getObstacleAvoidanceAction(sensorReadings) {
    action = getZeroAction();

    var wallLeft = false;
    var wallRight = false;
    if (sensorReadings.leftWall.count > 0 || sensorReadings.leftRobot.count > 0 ) {
        wallLeft = true;
    }
    if (sensorReadings.rightWall.count > 0 || sensorReadings.rightRobot.coutn > 0) {
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

        // For VERSION 2
        /*
        this.lastLeftNest = 0;
        this.lastRightNest = 0;
        */

        // For VERSION 3.  The centre queue has a shorter length to emulate a
        // sensor that lies ahead of the left/right sensors.
        /*
        this.leftQueue = getArrayWithLimitedLength(4);
        this.centreQueue = getArrayWithLimitedLength(4);
        this.rightQueue = getArrayWithLimitedLength(4);
        */
    }

    /* VERSION 1: THIS VERSION WORKS WHEN THE CENTRE SENSOR IS FORWARD OF THE
       LEFT AND RIGHT SENSORS. */
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

            action.textColour = "red";

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.textMessage = "A-";
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                return action;
            } else {
                action.textMessage = "A+";
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;
                return action;
            }

        } else if (centreNest >= rightNest && centreNest >= leftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.textMessage = "B";
            action.textColour = "green";
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            return action;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.textMessage = "C";
            action.textColour = "blue";
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        // SHOULDN'T REACH HERE.
        return null;
    }

    /* VERSION 2: THIS VERSION IS FOR ALL THREE SENSORS IN A LINE (LIKE ON THE
       ZUMO).  WE FAKE THE VERSION ABOVE BY USING THE LAST LEFT AND RIGHT
       SENSORS SO THAT WE STILL GET A TRIANGLE OF VALUES SAMPLED FROM THE
       SCALAR FIELD. */
    /*
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftObstacle.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;

        if (this.lastRightNest >= centreNest &&
            centreNest >= this.lastLeftNest) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
            } else {
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;
            }

        } else if (centreNest >= this.lastRightNest &&
                   centreNest >= this.lastLeftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        }

        this.lastLeftNest = leftNest;
        this.lastRightNest = rightNest;
        return action;
    }
    */
    /* VERSION 3: INTENDED FOR A RANDOMIZED BINARY SCALAR FIELD WHERE QUEUES
       OF PAST SENSOR VALUES ARE USED---BETTER EMULATING THE USE OF THE LINE
       SENSORS ON THE ZUMO. */
    /*
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftObstacle.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        this.leftQueue.push(sensorReadings.leftProbe.nestValue);
        this.centreQueue.push(sensorReadings.centreProbe.nestValue);
        this.rightQueue.push(sensorReadings.rightProbe.nestValue);
        var leftSum = this.leftQueue.reduce((a, b) => a + b, 0)
        var centreSum = this.centreQueue.reduce((a, b) => a + b, 0)
        var rightSum = this.rightQueue.reduce((a, b) => a + b, 0)

        var left = leftSum / this.leftQueue.length;
        var centre = centreSum / this.centreQueue.length;
        var right = rightSum / this.rightQueue.length;
        console.log(left + ", " + centre + ", " + right);

        if (right >= centre && centre >= left) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // We now act to maintain the centre value at the desired isoline.
            if (centre < this.threshold) {
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
            } else {
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;
            }

        } else if (centre >= right && centre >= left) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        }

        return action;
    }
    */
}

// From https://stackoverflow.com/questions/31023330/drop-last-element-of-javascript-array-when-array-reaches-specific-length
function getArrayWithLimitedLength(length) {
    var array = new Array();

    array.push = function () {
        if (this.length >= length) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    }

    return array;
}

/* This version is the same as that described in the SOCO 2018 paper. */
class OrbitalConstructionController {
    constructor() {
        this.innie = Math.random() < 0.5;
        if (this.innie) {
            this.threshold = 0.75
        } else {
            this.threshold = 0.7
        }
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();
        if (this.innie) {
            action.flashOn = true; // To visually distinguish innies/outies
        }

        if (sensorReadings.leftWall.count > 0 || sensorReadings.leftRobot.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;
        var leftPucks = sensorReadings.leftRedPuck.count;
        var rightPucks = sensorReadings.rightRedPuck.count;

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


/* Like the version above, but using three line sensors in a row to replicate
 * the situation on robots like the Zumo32U4 or Alphabot2. */
/*
class OrbitalConstructionController2 {
    constructor() {
        this.innie = Math.random() < 0.5;
        if (this.innie) {
            this.threshold = 0.75
        } else {
            this.threshold = 0.7
        }

        this.lastLeftNest = 0;
        this.lastRightNest = 0;
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

        if (this.lastRightNest >= centreNest &&
            centreNest >= this.lastLeftNest) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // These conditions steer in (for an innie) and out (for an outie)
            // to nudge a puck inwards or outwards.
            if (this.innie && rightPucks > 0) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
            } else if (!this.innie && leftPucks > 0) {
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
                action.emitPheromone = 10.0; // For debugging
            } else { 
                // We now act to maintain the centre value at the desired
                // isoline.
                if (centreNest < this.threshold) {
                    action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                } else {
                    action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;
                }
            }

        } else if (centreNest >= this.lastRightNest &&
                   centreNest >= this.lastLeftNest) {
            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
        } else {
            // We are heading downhill, turn right to return to clockwise orbit.
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
        }

        this.lastLeftNest = leftNest;
        this.lastRightNest = rightNest;
        return action;
    }
}
*/

/* Evolving from the original "OrbitalConstructionController" of the SOCO 2018
 * paper, this one treats walls and robots separately. */
class OrbitalConstructionController3 {
    constructor() {
        this.innie = Math.random() < 0.5;
        if (this.innie) {
            this.threshold = 0.75
        } else {
            this.threshold = 0.7
        }
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();
        if (this.innie) {
            action.flashOn = true; // To visually distinguish innies/outies
        }

        if (sensorReadings.leftWall.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }
        // Original behaviour
        /*
        if (sensorReadings.leftRobot.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }
        */
        if (sensorReadings.rightRobot.count > 0) {
            if (this.innie) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            } else {
                action.linearSpeed = 0.5*myGlobals.MAX_FORWARD_SPEED;
                //action.angularSpeed = -myGlobals.MAX_ANGULAR_SPEED;
            }
            return action;
        }

        var leftNest = sensorReadings.leftProbe.nestValue;
        var centreNest = sensorReadings.centreProbe.nestValue;
        var rightNest = sensorReadings.rightProbe.nestValue;
        var leftPucks = sensorReadings.leftRedPuck.count;
        var rightPucks = sensorReadings.rightRedPuck.count;

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

