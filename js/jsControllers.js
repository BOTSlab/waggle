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
        textColour: "blue"
    };
}

function getAction(linear, angular) {
    return {
        linearSpeed: linear,
        angularSpeed: angular,
        gripperOn: false,
        flashOn: false,
        emitPheromone: false,
        textMessage: "",
        textColour: "cyan"
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
       LEFT AND RIGHT SENSORS. 
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftWall.count > 0) {
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
    */

    /* VERSION 2: THIS VERSION IS FOR ALL THREE SENSORS IN A LINE (LIKE ON THE
       ZUMO).  WE FAKE THE VERSION ABOVE BY USING THE LAST LEFT AND RIGHT
       SENSORS SO THAT WE STILL GET A TRIANGLE OF VALUES SAMPLED FROM THE
       SCALAR FIELD. */
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftWall.count > 0) {
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

    
    /* VERSION 3: INTENDED FOR A RANDOMIZED BINARY SCALAR FIELD WHERE QUEUES
       OF PAST SENSOR VALUES ARE USED---BETTER EMULATING THE USE OF THE LINE
       SENSORS ON THE ZUMO. */
    /*
    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftWall.count > 0) {
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
class OrbitalConstructionControllerLINESENSORS {
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

        if (sensorReadings.leftWall.count > 0) {
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


/* Evolving from the original "OrbitalController" of the SOCO 2018
 * paper, this has the following fundamental differences:
 *    - Adapted sensor positions for a wedge at the front of the robot.
 */
class OrbitController2 {
    constructor() {
        this.threshold = 0.75;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();

        if (sensorReadings.leftWall.count > 0) {
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
            action.textColour = "white";
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }

        // SHOULDN'T REACH HERE.
        return null;
    }
}

/* Evolving from the original "OrbitalConstructionController" of the SOCO 2018
 * paper, this has the following fundamental differences:
 *    - treats walls and robots separately 
 */
class OrbitalConstructionController2 {
    constructor() {
        this.innie = false;
        this.threshold = 0.75;
        /*
        this.innie = Math.random() < 0.5;
        if (this.innie) {
            this.threshold = 0.75
        } else {
            this.threshold = 0.7
        }
        */

        this.lastAngularSpeed = 0;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getForwardAction();
        if (this.innie) {
            action.flashOn = true; // To visually distinguish innies/outies
        }

        if (sensorReadings.rightWall.count > 0) {
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            return action;
        }
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
//        var rightPucks = sensorReadings.rightRedPuck.count;

        var diffThreshold = 0.0;//0.02;


        if (rightNest - centreNest >= diffThreshold && centreNest - leftNest >= diffThreshold) {
            // The gradient is in the desired orientation with the highest
            // sensed value to the right, then the centre value in the middle,
            // followed by the lowest on the left.

            // These conditions steer in (for an innie) and out (for an outie)
            // to nudge a puck inwards or outwards.
            if (this.innie && rightPucks > 0) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
                this.lastAngularSpeed = action.angularSpeed;
                action.textColour = "red";
                action.textMessage = "AT";
                return action;
            } else if (!this.innie && leftPucks > 0) {
                action.textColour = "red";
                action.textMessage = "AT";
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
                this.lastAngularSpeed = action.angularSpeed;
                return action;
            } 

            // We now act to maintain the centre value at the desired isoline.
            if (centreNest < this.threshold) {
                action.textColour = "red";
                action.textMessage = "A+";
                action.angularSpeed = 0.3 * myGlobals.MAX_ANGULAR_SPEED;
                this.lastAngularSpeed = action.angularSpeed;
                return action;
            } else {
                action.textColour = "red";
                action.textMessage = "A-";
                action.angularSpeed = -0.3 * myGlobals.MAX_ANGULAR_SPEED;                
                this.lastAngularSpeed = action.angularSpeed;
                return action;
            }

        } else if (centreNest - rightNest >= diffThreshold && centreNest - leftNest >= diffThreshold) {

            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.textColour = "green";
            action.textMessage = "B";
            action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
            this.lastAngularSpeed = action.angularSpeed;
            return action;

        } else if (rightNest - centreNest >= diffThreshold) {

            if (this.innie && rightPucks > 0) {
                action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
                this.lastAngularSpeed = action.angularSpeed;
                action.textColour = "red";
                action.textMessage = "AT";
                return action;
            } else if (!this.innie && leftPucks > 0) {
                action.textColour = "red";
                action.textMessage = "AT";
                action.angularSpeed = - myGlobals.MAX_ANGULAR_SPEED;
                this.lastAngularSpeed = action.angularSpeed;
                return action;
            } 

            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.textColour = "black";
            action.textMessage = "X";
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            this.lastAngularSpeed = action.angularSpeed;
            return action;

        } else if (leftNest - centreNest >= diffThreshold) {

            // We are heading uphill of the gradient, turn left to return to a
            // clockwise orbit.
            action.textColour = "black";
            action.textMessage = "Y";
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            this.lastAngularSpeed = action.angularSpeed;
            return action;
    
        } else {
            /*
            // We are heading downhill, turn right to return to clockwise orbit.
            action.textColour = "white";
            action.textMessage = "C";
            action.angularSpeed = myGlobals.MAX_ANGULAR_SPEED;
            this.lastAngularSpeed = action.angularSpeed;
            return action;
            */

            action.angularSpeed = this.lastAngularSpeed;  
            return action;          
        }

        // SHOULDN'T REACH HERE.
        return null;
    }
}

/* Just for plotting purposes
 */
class OC2PlotController {
    constructor() {
        this.threshold = 1.0;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        var action = getZeroAction();

        var L = sensorReadings.leftProbe.nestValue;
        var C = sensorReadings.centreProbe.nestValue;
        var R = sensorReadings.rightProbe.nestValue;

        if (L >= C && C >= R) {
            action.textMessage = "LCR";
            action.textColour = "lime";
        } else if (L >= R && R >= C) {
            action.textMessage = "LRC";
            action.textColour = "green";

        } else if (C >= L && L >= R) {
            action.textMessage = "CLR";
            action.textColour = "cyan";
        } else if (C >= R && R >= L) {
            action.textMessage = "CRL";
            action.textColour = "teal";

        } else if (R >= L && L >= C) {
            action.textMessage = "RLC";
            action.textColour = "red";
        } else if (R >= C && C >= C) {
            action.textMessage = "RCL";
            action.textColour = "maroon";
        }

        return action;          
    }
}

class OC2VariantController {
    constructor() {
        this.threshold = 0.1;
        this.puckVariant = 5;
        this.thresholdVariant = 1;
        this.defaultVariant = 12;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        let left = getAction(myGlobals.MAX_FORWARD_SPEED, -myGlobals.MAX_ANGULAR_SPEED);
        let right = getAction(myGlobals.MAX_FORWARD_SPEED, myGlobals.MAX_ANGULAR_SPEED);
        let veerLeft = getAction(myGlobals.MAX_FORWARD_SPEED, -0.3*myGlobals.MAX_ANGULAR_SPEED);
        let veerRight = getAction(myGlobals.MAX_FORWARD_SPEED, 0.3*myGlobals.MAX_ANGULAR_SPEED);

        if (sensorReadings.rightWall.count > 0) {
            return veerRight;
        }

        let L = sensorReadings.leftProbe.nestValue;
        let C = sensorReadings.centreProbe.nestValue;
        let R = sensorReadings.rightProbe.nestValue;
        let leftPucks = sensorReadings.leftRedPuck.count;

        // Determine the current ordering of scalar field sensors.
        let ordering = 0;
        if (L >= C && C >= R) {
            //action.textMessage = "LCR";
            //action.textColour = "lime";
            ordering = 0b000001;
        } else if (L >= R && R >= C) {
            //action.textMessage = "LRC";
            //action.textColour = "green";
            ordering = 0b000010;            
        } else if (C >= L && L >= R) {
            //action.textMessage = "CLR";
            //action.textColour = "cyan";
            ordering = 0b000100;            
        } else if (C >= R && R >= L) {
            //action.textMessage = "CRL";
            //action.textColour = "teal";
            ordering = 0b001000;            
        } else if (R >= L && L >= C) {
            //action.textMessage = "RLC";
            //action.textColour = "red";
            ordering = 0b010000;            
        } else if (R >= C && C >= L) {
            //action.textMessage = "RCL";
            //action.textColour = "maroon";
            ordering = 0b100000;            
        }

        if (this.puckVariant & ordering && leftPucks > 0)   
            return left;
        if (this.thresholdVariant & ordering) {
            if (C < this.threshold)
                return veerLeft;
            else
                return veerRight;
        }
        if (this.defaultVariant & ordering)
            return right;
        else
            return left;
    }
}

// Assuming L, C and R collected by co-linear sensors.  Trying different mechanism for orbit.
class OC3OrbitController {
    constructor() {
        this.threshold = 0.7;

        this.lastDiff = 0;
        this.maxDiff = 0;
        this.lastLeft = false;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        let left = getAction(myGlobals.MAX_FORWARD_SPEED, -myGlobals.MAX_ANGULAR_SPEED);
        let right = getAction(myGlobals.MAX_FORWARD_SPEED, myGlobals.MAX_ANGULAR_SPEED);
        let veerLeft = getAction(myGlobals.MAX_FORWARD_SPEED, -0.3*myGlobals.MAX_ANGULAR_SPEED);
        let veerRight = getAction(myGlobals.MAX_FORWARD_SPEED, 0.3*myGlobals.MAX_ANGULAR_SPEED);

        if (sensorReadings.rightWall.count > 0) {
            return veerRight;
        }

        let L = sensorReadings.leftProbe.nestValue;
        let C = sensorReadings.centreProbe.nestValue;
        let R = sensorReadings.rightProbe.nestValue;
        let leftPucks = sensorReadings.leftRedPuck.count;

        let diff = R - L;

        let action = undefined;
        if (diff < 0) {
            action = right;
            this.lastLeft = false;
        } else if (diff > 0.5*this.maxDiff) {
            if (C > this.threshold) {
                action = left;
                this.lastLeft = true;
            } else {
                action = right;
                this.lastLeft = false;
            }

        } else if (diff > this.lastDiff) {
            // Diff has risen (which is good).  Keep doing the same as last time.
            if (this.lastLeft) {
                action = left;
                this.lastLeft = true;
            } else {
                action = right;
                this.lastLeft = false;
            }
        } else {
            // Diff has fallen (bad).  Do the opposite of last time.
            if (this.lastLeft) {
                action = right;
                this.lastLeft = false;
            } else {
                action = left;
                this.lastLeft = true;
            }
        }

        action.textMessage = diff;
        this.lastDiff = diff;
        if (diff > this.maxDiff) {
            this.maxDiff = diff;
        }
        return action;
    }
}