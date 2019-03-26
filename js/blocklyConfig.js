//
// Block definitions (i.e. how they look, inputs/outpus).
//
Blockly.Blocks['robot_left_obstacle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Obstacle (wall/robot) on left?");
    this.setInputsInline(false);
    this.setOutput(true, "Boolean");
    this.setColour(0);
 this.setTooltip("True if the left obstacle sensor detects a wall or another robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_right_obstacle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Obstacle (wall/robot) on right?");
    this.setOutput(true, null);
    this.setColour(0);
 this.setTooltip("True if the right obstacle sensor detects a wall or another robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_left_puck_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Number")
        .appendField(new Blockly.FieldDropdown([["red","red"], ["green","green"]]), "puckColour")
        .appendField("pucks on left");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Count of the number of pucks (red or green) detected by the left puck sensor.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_right_puck_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Number ")
        .appendField(new Blockly.FieldDropdown([["red","red"], ["green","green"]]), "puckColour")
        .appendField("pucks on right");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Count of the number of pucks (red or green) detected by the right puck sensor.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_inner_puck_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Number")
        .appendField(new Blockly.FieldDropdown([["red","red"], ["green","green"]]), "puckColour")
        .appendField("pucks near gripper");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Count of the number of pucks (red or green) detected by the sensor at the front of the robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_puck_held'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["red","red"], ["green","green"], ["red or green","redOrGreen"]]), "puckColour")
        .appendField("puck held?");
    this.setOutput(true, "Boolean");
    this.setColour(0);
 this.setTooltip("Indicates whether the robot is currently holding the specified type of puck.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_set_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set robot's text")
        .appendField(new Blockly.FieldTextInput("Hi!"), "text");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Set the text displayed next to the robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_set_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set speeds:")
        .appendField("forward ")
        .appendField(new Blockly.FieldNumber(0, -10, 10), "linearSpeed")
        .appendField("angular")
        .appendField(new Blockly.FieldNumber(0, -10, 10), "angularSpeed");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("forward speed: 10 (full speed ahead), -10 (full reverse).  angular speed: 10 (max right turn), -10 (max left turn).");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_hold_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Hold speed for")
        .appendField(new Blockly.FieldNumber(0, 0), "holdTime")
        .appendField("milliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Maintain the robot's speed for the specified time interval.  As other robot commands, the speed will only be held once the Execute command is reached.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_flash_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Number of flashes ");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Count of the number of flashes detected from other robots.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_activate_gripper'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Activate gripper");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Activate the gripper which holds a single puck at the front of the robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_deactivate_gripper'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Deactivate gripper");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Deactivate the gripper which holds a single puck at the front of the robot.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_activate_flash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Activate flash");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Activate the flash which is detectable by other robots.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_deactivate_flash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Deactivate flash");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Deactivate the flash which is detectable by other robots.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_set_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set variable")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName")
        .appendField("to")
        .appendField(new Blockly.FieldNumber(0), "newValue");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
 this.setTooltip("Sets one of three variables to a given value.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_change_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Change variable")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName")
        .appendField("by")
        .appendField(new Blockly.FieldNumber(0), "deltaValue");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
 this.setTooltip("Change one of three variables by adding the given value to it (subtract if the value is negative).");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_set_text_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set robot's text to")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Sets the text next to the robot to the given variable's value.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_get_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Get ")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName");
    this.setOutput(true, "Number");
    this.setColour(300);
 this.setTooltip("Gets the value of the given variable.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_execute'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, "*"))
        .appendField("Execute!");
    this.setPreviousStatement(true, null);
    this.setColour(105);
 this.setTooltip("Execute the last set robot speed (with hold time, if any), set gripper and flash as dictated above.  Then allow the simulation to proceed and return to the top of the program.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_emit_pheromone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Emit pheromone quantity")
        .appendField(new Blockly.FieldNumber(10, 0, 10), "quantity");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Emits pheromones from the robot which will evaporate on their own.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_left_pheromone_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pheromone quantity on left");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of pheromones detected by the left sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_right_pheromone_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pheromone quantity on right");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of pheromones detected by the right sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_left_nest_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Nest scent quantity on left");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of nest scent detected by the left sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_right_nest_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Nest scent quantity on right");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of nest scent detected by the right sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_centre_pheromone_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pheromone quantity ahead");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of pheromones detected by the forward sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['robot_centre_nest_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Nest scent quantity ahead");
    this.setOutput(true, "Number");
    this.setColour(0);
 this.setTooltip("Concentration of nest scent detected by the forward sensor.  Result ranges from 0 to 1.");
 this.setHelpUrl("");
  }
};

/*
Blockly.Blocks['robot_set_speed_slots'] = {
  init: function() {
    this.appendValueInput("linearSpeed")
        .setCheck("Number")
        .appendField("Set speeds:")
        .appendField("forward");
    this.appendValueInput("angularSpeed")
        .setCheck("Number")
        .appendField("angular");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("forward speed: 10 (full speed ahead), -10 (full reverse).  angular speed: 10 (max right turn), -10 (max left turn).");
 this.setHelpUrl("");
  }
};
*/

/*
Blockly.Blocks['robot_hold_speed_slot'] = {
  init: function() {
    this.appendValueInput("holdTime")
        .setCheck(null)
        .appendField("Hold speed for");
    this.appendDummyInput()
        .appendField("milliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Maintain the robot's speed for the specified time interval.  As other robot commands, the speed will only be held once the Execute command is reached.");
 this.setHelpUrl("");
  }
};
*/

/*
Blockly.Blocks['robot_set_variable_slot'] = {
  init: function() {
    this.appendValueInput("value")
        .setCheck("Number")
        .appendField("Set variable")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
 this.setTooltip("Sets one of three variables to a given value.");
 this.setHelpUrl("");
  }
};
*/

/*
Blockly.Blocks['robot_change_variable_slot'] = {
  init: function() {
    this.appendValueInput("value")
        .setCheck("Number")
        .appendField("Change variable")
        .appendField(new Blockly.FieldDropdown([["variableA","variableA"], ["variableB","variableB"], ["variableC","variableC"]]), "variableName")
        .appendField("by");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
 this.setTooltip("Change one of three variables by adding the given value to it (subtract if the value is negative).");
 this.setHelpUrl("");
  }
};
*/

/*
Blockly.Blocks['robot_emit_pheromone_slot'] = {
  init: function() {
    this.appendValueInput("quantity")
        .setCheck("Number")
        .appendField("Emit pheromone quantity");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("Emits pheromones from the robot which will evaporate on their own.  Provide a number in the range 0 - 10.");
 this.setHelpUrl("");
  }
};
*/

Blockly.Blocks['robot_within_goal_zone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Within goal zone?");
    this.setOutput(true, "Boolean");
    this.setColour(0);
 this.setTooltip("True if the robot lies within the goal zone.");
 this.setHelpUrl("");
  }
};

//
// Block functions
//


Blockly.JavaScript['robot_left_obstacle'] = function(block) {
  var code = 'sensorReadings.leftWall.count > 0 || sensorReadings.leftRobot.count > 0';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_right_obstacle'] = function(block) {
  var code = 'sensorReadings.rightWall.count > 0 || sensorReadings.rightRobot.count > 0';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_left_obstacle_count'] = function(block) {
  var code = 'sensorReadings.leftWall.count + sensorReadings.leftRobot.count';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_right_obstacle_count'] = function(block) {
  var code = 'sensorReadings.rightWall.count + sensorReadings.rightRobot.count';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_left_puck_count'] = function(block) {
  var dropdown_puckcolour = block.getFieldValue('puckColour');
  var code;
  if (dropdown_puckcolour == "red") {
    code = 'sensorReadings.leftRedPuck.count';
  } else {
    code = 'sensorReadings.leftGreenPuck.count';
  }
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_right_puck_count'] = function(block) {
  var dropdown_puckcolour = block.getFieldValue('puckColour');
  var code;
  if (dropdown_puckcolour == "red") {
    code = 'sensorReadings.rightRedPuck.count';
  } else {
    code = 'sensorReadings.rightGreenPuck.count';
  }
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_inner_puck_count'] = function(block) {
  var dropdown_puckcolour = block.getFieldValue('puckColour');
  var code;
  if (dropdown_puckcolour == "red") {
    code = 'sensorReadings.innerRedPuck.count';
  } else {
    code = 'sensorReadings.innerGreenPuck.count';
  }
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_puck_held'] = function(block) {
  var dropdown_puckcolour = block.getFieldValue('puckColour');
  var code;
  if (dropdown_puckcolour == "red") {
    code = 'redPuckHeld';
  } else if (dropdown_puckcolour == "green") {
    code = 'greenPuckHeld';
  } else {
    code = 'redPuckHeld || greenPuckHeld';
  }
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_set_text'] = function(block) {
  var text_text = block.getFieldValue('text');
  var code = `textMessage = "${text_text}";\n`;
  return code;
};

function setSpeedsCode(number_linear_speed, number_angular_speed) {
  if (isNaN(number_linear_speed)) {
      number_linear_speed = 0;
  }
  if (isNaN(number_angular_speed)) {
      number_angular_speed = 0;
  }
  var scaledLinearSpeed = myGlobals.MAX_FORWARD_SPEED * number_linear_speed / 10.0;
  var scaledAngularSpeed = myGlobals.MAX_ANGULAR_SPEED * number_angular_speed / 10.0;

  var code = `linearSpeed = ${scaledLinearSpeed};\n angularSpeed = ${scaledAngularSpeed};\n`;

  return code;
}

Blockly.JavaScript['robot_set_speed'] = function(block) {
  var number_linear_speed = parseFloat(block.getFieldValue('linearSpeed'));
  var number_angular_speed = parseFloat(block.getFieldValue('angularSpeed'));
  return setSpeedsCode(number_linear_speed, number_angular_speed);
};

Blockly.JavaScript['robot_hold_speed'] = function(block) {
    var number_holdtime = parseInt(block.getFieldValue('holdTime'));

    if (isNaN(number_holdtime)) {
        number_holdtime = 0;
    }
    return `holdTime = ${number_holdtime};\n`;
};

Blockly.JavaScript['robot_flash_count'] = function(block) {
  var code = 'sensorReadings.flash.count';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_activate_gripper'] = function(block) {
  return 'gripperOn = true;\n';
//  return 'setGripperOn(true);\n';
};

Blockly.JavaScript['robot_deactivate_gripper'] = function(block) {
  return 'gripperOn = false;\n';
//  return 'setGripperOn(false);\n';
};

Blockly.JavaScript['robot_activate_flash'] = function(block) {
  return 'flashOn = true;\n';
//  return 'setFlashOn(true);\n';
};

Blockly.JavaScript['robot_deactivate_flash'] = function(block) {
  return 'flashOn = false;\n';
//  return 'setFlashOn(false);\n';
};

Blockly.JavaScript['robot_set_variable'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  var number_newvalue = block.getFieldValue('newValue');
  var code = `${dropdown_variablename} = ${number_newvalue};\n`;
  return code;
};

Blockly.JavaScript['robot_change_variable'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  var number_deltavalue = block.getFieldValue('deltaValue');
  var code = `${dropdown_variablename} = ${dropdown_variablename} + ${number_deltavalue};\n`;
  return code;
};

Blockly.JavaScript['robot_set_text_variable'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  var code = `textMessage = ${dropdown_variablename};\n`;
  return code;
};

Blockly.JavaScript['robot_get_variable'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  var code = `${dropdown_variablename}`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_execute'] = function(block) {
  return 'executed = true;\n';
};

Blockly.JavaScript['robot_emit_pheromone'] = function(block) {
  var number_quantity = block.getFieldValue('quantity');
  var code = `emitPheromone = ${number_quantity};\n`;
  return code;
};

Blockly.JavaScript['robot_left_pheromone_value'] = function(block) {
  var code = 'sensorReadings.leftProbe.pheromoneValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_right_pheromone_value'] = function(block) {
  var code = 'sensorReadings.rightProbe.pheromoneValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_left_nest_value'] = function(block) {
  var code = 'sensorReadings.leftProbe.nestValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_right_nest_value'] = function(block) {
  var code = 'sensorReadings.rightProbe.nestValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_centre_pheromone_value'] = function(block) {
  var code = 'sensorReadings.centreProbe.pheromoneValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['robot_centre_nest_value'] = function(block) {
  var code = 'sensorReadings.centreProbe.nestValue';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

/*
Blockly.JavaScript['robot_set_speed_slots'] = function(block) {
  //var value_linearspeed = Blockly.JavaScript.valueToCode(block, 'linearSpeed', Blockly.JavaScript.ORDER_ATOMIC);
  var value_linearspeed = eval(Blockly.JavaScript.valueToCode(block, 'linearSpeed', Blockly.JavaScript.ORDER_ATOMIC));
  //var value_angularspeed = Blockly.JavaScript.valueToCode(block, 'angularSpeed', Blockly.JavaScript.ORDER_ATOMIC);
  var value_angularspeed = eval(Blockly.JavaScript.valueToCode(block, 'angularSpeed', Blockly.JavaScript.ORDER_ATOMIC));
  return setSpeedsCode(value_linearspeed, value_angularspeed);
};
*/

/*
Blockly.JavaScript['robot_hold_speed_slot'] = function(block) {
  //var value_holdtime = Blockly.JavaScript.valueToCode(block, 'holdTime', Blockly.JavaScript.ORDER_ATOMIC);
  var value_holdtime = eval(Blockly.JavaScript.valueToCode(block, 'holdTime', Blockly.JavaScript.ORDER_ATOMIC));
  if (isNaN(value_holdtime)) {
      value_holdtime = 0;
  }
  return `holdTime = ${value_holdtime};\n`;
};
*/

/*
Blockly.JavaScript['robot_set_variable_slot'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  //var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var value_value = eval(Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC));
  var code = `${dropdown_variablename} = ${value_value};\n`;
  return code;
};
*/

/*
Blockly.JavaScript['robot_change_variable_slot'] = function(block) {
  var dropdown_variablename = block.getFieldValue('variableName');
  //var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var value_value = eval(Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC));
  var code = `${dropdown_variablename} = ${dropdown_variablename} + ${value_value};\n`;
  return code;
};
*/

/*
Blockly.JavaScript['robot_emit_pheromone_slot'] = function(block) {
  //var value_quantity = Blockly.JavaScript.valueToCode(block, 'quantity', Blockly.JavaScript.ORDER_ATOMIC);
  var value_quantity = eval(Blockly.JavaScript.valueToCode(block, 'quantity', Blockly.JavaScript.ORDER_ATOMIC));
  var code = `emitPheromone = ${value_quantity};\n`;
  return code;
};
*/

Blockly.JavaScript['robot_within_goal_zone'] = function(block) {
  var code = 'sensorReadings.goalZone.count > 0';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




var toolbox = document.getElementById("toolbox");

var options = { 
	toolbox : toolbox, 
	collapse : true, 
	comments : true, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : true, 
	horizontalLayout : false, 
	toolboxPosition : 'start', 
	css : true, 
	media : 'https://blockly-demo.appspot.com/static/media/', 
	rtl : false, 
	scrollbars : true, 
	sounds : true, 
	oneBasedIndex : true
};

// Inject blockly into its div.
// From: https://developers.google.com/blockly/guides/configure/web/resizable
var blocklyArea = document.getElementById('blocklyArea');
var blocklyDiv = document.getElementById('blocklyDiv');
var workspace = Blockly.inject(blocklyDiv,
    {toolbox: document.getElementById('toolbox')});
var onresize = function(e) {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  var element = blocklyArea;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(workspace);
};
window.addEventListener('resize', onresize, false);
onresize();
Blockly.svgResize(workspace);