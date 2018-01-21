/*
 * In this file we define all of the possible controller classes for robots.
 * Javascript doesn't have interfaces so we are not really enforcing this, but
 * all controllers should have a getAction method as follows:
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

        var innerPucks = sensorReadings.innerPuck.count;
        var leftPucks = sensorReadings.leftPuck.count;
        var rightPucks = sensorReadings.rightPuck.count;
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
