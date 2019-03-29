/*
 * Here we define the controller class that interfaces with Blockly.  It has
 * the same interface as the Javascript controllers (in 'jsControllers.js')
 * although this is not enforced.
 */

class Controller {
    constructor() {
        this.action = getZeroAction();
        this.holding = false;
        this.holdTime = 0;

        this.variableA = 0;
        this.variableB = 0;
        this.variableC = 0;
    }

    getAction(timestamp, sensorReadings, redPuckHeld, greenPuckHeld) {
        // First, see if we're holding our speed and if so, wait until the
        // hold time elapses.
        if (this.holding) {
            var elapsed = timestamp - this.holdStartTime;
            //console.log("elapsed: " + elapsed);
            if (elapsed < this.holdTime) {
                return this.action;
            } else {
                this.holding = false;
                this.holdTime = 0;
            }
        }

        // Get the javascript code from Blockly or the JS editor.
        var code;
        if (myGlobals.usingBlockly) {            
            Blockly.JavaScript.addReservedWords('code');
            code = Blockly.JavaScript.workspaceToCode(workspace);
        } else {
            // Get the javascript code from the editor.
            code = myCodeMirror.getValue();            
        }

        if (code.length == 0) {
            let message = "Status: Ready. Please design your controller below";
            document.getElementById('statusMessage').innerHTML = message;
            document.getElementById('statusMessage').style.backgroundColor = "green";
            return getZeroAction();

        } else {
            try {
                // When we execute 'code' the variables below may be modified.
                // Those belonging to the action are kept from the last iteration.
                var linearSpeed = 0; //this.action.linearSpeed;
                var angularSpeed = 0; //this.action.angularSpeed;
                var gripperOn = this.action.gripperOn;
                var flashOn = this.action.flashOn;
                var textMessage = this.action.textMessage;
                var variableA = this.variableA;
                var variableB = this.variableB;
                var variableC = this.variableC;
                var executed = false;
                var holdTime = 0;
                var emitPheromone = 0;

                // The outcome of executing the Blockly code is to set (or leave
                // unchanged) the variables above.
                var result = eval(code);
                if (!result || !executed) {
                    throw "Missing final Execute!";
                }

                // Make sure that an illegal speed hasn't been set.
                if (Math.abs(linearSpeed) > myGlobals.MAX_FORWARD_SPEED) {
                    throw "linearSpeed must be in the range [-" + 
                        myGlobals.MAX_FORWARD_SPEED + ", " +
                        myGlobals.MAX_FORWARD_SPEED + "]";
                }
                if (Math.abs(angularSpeed) > myGlobals.MAX_ANGULAR_SPEED) {
                    throw "angularSpeed must be in the range [-" + 
                        myGlobals.MAX_ANGULAR_SPEED + ", " +
                        myGlobals.MAX_ANGULAR_SPEED + "]";
                }

                this.action = { linearSpeed: linearSpeed,
                                angularSpeed: angularSpeed,
                                gripperOn: gripperOn,
                                flashOn: flashOn,
                                emitPheromone: emitPheromone,
                                textMessage: textMessage,
                                textColour: "lightgrey" };

                this.variableA = variableA;
                this.variableB = variableB;
                this.variableC = variableC;

                document.getElementById('statusMessage').innerHTML = "Status: Good";
                document.getElementById('statusMessage').style.backgroundColor = "green";

                if (holdTime > 0) {
                    //console.log("holdTime: " + holdTime);
                    this.holdStartTime = timestamp;
                    this.holdTime = holdTime;
                    this.holding = true;
                }

                return this.action;

            } catch (e) {
                let message = "Status: Problem with controller!" +
                              "\n" + e;
                document.getElementById('statusMessage').innerHTML = message;
                document.getElementById('statusMessage').style.backgroundColor = "red";
                return getZeroAction();
            }
        }

    }
}

/*
 THIS VERSION USES THE JS INTERPRETER
 (https://github.com/NeilFraser/JS-Interpreter) WHICH IS AWESOME BUT
 VERY SLOW COMPARED TO JUST USING EVAL IN THE VERSION ABOVE.  

class BlocklyController {

    constructor() {
        this.action = getZeroAction();
        this.holding = false;
        this.holdTime = 0;
    }

    getAction(timestamp, sensorReadings, puckHeld) {
        // First, see if we're holding our speed and if so, wait until the
        // hold time elapses.
        if (this.holding) {
            var elapsed = timestamp - this.holdStartTime;
            console.log("elapsed: " + elapsed);
            if (elapsed < this.holdTime) {
                return this.action;
            } else {
                this.holding = false;
                this.holdTime = 0;
            }
        }

        // Get the javascript code from Blockly.
        Blockly.JavaScript.addReservedWords('code');
        var code = Blockly.JavaScript.workspaceToCode(workspace);
                
        try {

            // When we execute 'code' the variables below may be modified.
            // Those belonging to the action are kept from the last iteration.
            var linearSpeed = this.action.linearSpeed;
            var angularSpeed = this.action.angularSpeed;
            var gripperOn = this.action.gripperOn;
            var flashOn = this.action.flashOn;
            var holdTime = 0;

            // The outcome of executing the Blockly code is to set (or leave
            // unchanged) the variables above.
            //eval(code);

            var myInterpreter = new Interpreter(code, (interpreter, scope) => {
                interpreter.setProperty(
                  scope, 'setLinearSpeed',
                  interpreter.createNativeFunction(argument => {
                    linearSpeed = argument;
                  })
                );
                interpreter.setProperty(
                  scope, 'setAngularSpeed',
                  interpreter.createNativeFunction(argument => {
                    angularSpeed = argument;
                  })
                );
                interpreter.setProperty(
                  scope, 'setGripperOn',
                  interpreter.createNativeFunction(argument => {
                    gripperOn = argument;
                  })
                );
                interpreter.setProperty(
                  scope, 'setFlashOn',
                  interpreter.createNativeFunction(argument => {
                    flashOn = argument;
                  })
                );
                interpreter.setProperty(
                  scope, 'setHoldTime',
                  interpreter.createNativeFunction(argument => {
                    holdTime = argument;
                  })
                );
              });

            myInterpreter.run();

            this.action = { linearSpeed: linearSpeed,
                            angularSpeed: angularSpeed,
                            gripperOn: gripperOn,
                            flashOn: flashOn };

        } catch (e) {
            alert(e);
            console.log("BlocklyController: Problem with control code!");

            return getZeroAction();
        }

        if (holdTime > 0) {
            console.log("holdTime: " + holdTime);
            this.holdStartTime = timestamp;
            this.holdTime = holdTime;
            this.holding = true;
        }

        return this.action;
    }
}
*/
