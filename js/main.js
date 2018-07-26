// module aliases
var Engine = Matter.Engine,
//    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

// The configuration variable below dictates the sensor configuration of the
// robot's as well as other aspects of the system.  Its value comes from the
// part of the URL that follows '#'.  If there is no '#' then we use the
// default configuration.
var configuration = location.hash;
if (!configuration) {
    configuration = "#TUTORIAL";
}

var myGlobals = {
    configuration: configuration,
    usingBlockly: true,
    width : 100,
    height : 800,
    maxStep : 100000,
    MAX_FORWARD_SPEED: 0.015,
    MAX_ANGULAR_SPEED: 0.2,
    wallThickness: 100,
    visibleWallThickness: 3,
    nRobots: 1,
    nRedPucks: 0,
    nGreenPucks: 0,
    robotRadius: 15,
    puckRadius: 5,
    obstacleSensorSizeFactor: 0.75,
    pheromoneDiffusionRate: 0.01,
    pheromoneDecayRate: 0.001,
    innerSensorRadius: 12.5,
    outerSensorRadius: 15,
    frictionAir: 1.0,
    stepsBetweenControllerUpdates: 1,
    allowMovement: true,
    showSensors: false,
    doAnalysis: true,
    resetAfterMaxStep: false,
    showPheromoneGrid: false,
    showNestGrid: false
};

// Html customiziation depending upon the configuration.
if (configuration == "#TUTORIAL") {
    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.nRedPucks = 0;
    myGlobals.nGreenPucks = 0;
    document.getElementById('nRedPucksLabel').style.display = "none";
    document.getElementById('nRedPucksSlider').style.display = "none";
    document.getElementById('nRedPucksText').style.display = "none";
    document.getElementById('nGreenPucksLabel').style.display = "none";
    document.getElementById('nGreenPucksSlider').style.display = "none";
    document.getElementById('nGreenPucksText').style.display = "none";
    document.getElementById('gridDiv').style.display = "none";
    myGlobals.doAnalysis = false;
    document.getElementById('analysisControlsDiv').style.display = "none";
} else if (configuration == "#PRE_CLUSTER" || configuration == "#SIMPLE_CLUSTER" || configuration == "#ADVANCED_CLUSTER") {
    if (configuration == "#PRE_CLUSTER") {
        myGlobals.doAnalysis = false;
        document.getElementById('analysisControlsDiv').style.display = "none";
    }
    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.nRedPucks = 30;
    myGlobals.nGreenPucks = 0;
    document.getElementById('nGreenPucksLabel').style.display = "none";
    document.getElementById('nGreenPucksSlider').style.display = "none";
    document.getElementById('nGreenPucksText').style.display = "none";
    document.getElementById('gridDiv').style.display = "none";
} else if (configuration == "#SORT") {
    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.nRedPucks = 30;
    myGlobals.nGreenPucks = 30;
    document.getElementById('gridDiv').style.display = "none";
} else if (configuration == "#FIREFLY") {
    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.nRedPucks = 0;
    myGlobals.nGreenPucks = 0;
    document.getElementById('nRedPucksLabel').style.display = "none";
    document.getElementById('nRedPucksSlider').style.display = "none";
    document.getElementById('nRedPucksText').style.display = "none";
    document.getElementById('nGreenPucksLabel').style.display = "none";
    document.getElementById('nGreenPucksSlider').style.display = "none";
    document.getElementById('nGreenPucksText').style.display = "none";
    document.getElementById('gridDiv').style.display = "none";
} else if (configuration == "#PHEROMONE") {
    myGlobals.width = 500;
    myGlobals.height = 800;
    myGlobals.showPheromoneGrid = true;
    document.getElementById('gridSelect').value = "pheromone";
    myGlobals.nRedPucks = 0;
    myGlobals.nGreenPucks = 10;
    document.getElementById('nRedPucksLabel').style.display = "none";
    document.getElementById('nRedPucksSlider').style.display = "none";
    document.getElementById('nRedPucksText').style.display = "none";
} else if (configuration == "#CONSTRUCT") {
    myGlobals.usingBlockly = false;

    // Big changes from the other configurations where the robot/puck size is modified 
    // (effects physics/speeds as well).
    myGlobals.robotRadius = 5;
    myGlobals.puckRadius = 6;
    myGlobals.obstacleSensorSizeFactor = 0.15;
    myGlobals.MAX_FORWARD_SPEED = 0.015 / 20.0;
    myGlobals.MAX_ANGULAR_SPEED = 0.2 / 40.0;

    // Changing pheromone rates just because we're using pheromones to show
    // trails for debugging.
    myGlobals.pheromoneDiffusionRate = 0.01;
    myGlobals.pheromoneDecayRate = 0.001;

    myGlobals.nRobots = 30;
    myGlobals.nRedPucks = 250;
    //myGlobals.nRedPucks = 100;
    myGlobals.nGreenPucks = 250;
    myGlobals.maxStep = 500;

    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.showNestGrid = true;
    document.getElementById('gridSelect').value = "nest";
    //document.getElementById('nGreenPucksLabel').style.display = "none";
    //document.getElementById('nGreenPucksSlider').style.display = "none";
    //document.getElementById('nGreenPucksText').style.display = "none";
    document.getElementById('blocklyControlsDiv').style.display = "none";
} else if (configuration == "#ENLARGED_ROBOT") {
    // This configuration is just to obtain a bigger view of the robot and
    // its sensors.
    myGlobals.robotRadius = 20;
    myGlobals.puckRadius = 24;
    myGlobals.obstacleSensorSizeFactor = 0.15;
    myGlobals.MAX_FORWARD_SPEED = 0.0;
    myGlobals.MAX_ANGULAR_SPEED = 0.0;

    myGlobals.nRobots = 1;
    myGlobals.nRedPucks = 0;
    myGlobals.nGreenPucks = 0;

    myGlobals.width = 500;
    myGlobals.height = 500;
    myGlobals.showNestGrid = true;
    document.getElementById('gridSelect').value = "nest";
    document.getElementById('nGreenPucksLabel').style.display = "none";
    document.getElementById('nGreenPucksSlider').style.display = "none";
    document.getElementById('nGreenPucksText').style.display = "none";
}

// Further html customization which is independent of the configuration.
document.getElementById('allowMovementCheckbox').checked = myGlobals.allowMovement;
document.getElementById('showSensorsCheckbox').checked = myGlobals.showSensors;
document.getElementById('nRobotsSlider').value = myGlobals.nRobots;
document.getElementById('nRobotsText').innerHTML = myGlobals.nRobots;
document.getElementById('nRedPucksSlider').value = myGlobals.nRedPucks;
document.getElementById('nRedPucksText').innerHTML = myGlobals.nRedPucks;
document.getElementById('nGreenPucksSlider').value = myGlobals.nGreenPucks;
document.getElementById('nGreenPucksText').innerHTML = myGlobals.nGreenPucks;
document.getElementById('maxStepSlider').value = myGlobals.maxStep;
document.getElementById('maxStepText').innerHTML = myGlobals.maxStep;
document.getElementById('doAnalysisCheckbox').checked = myGlobals.doAnalysis;
document.getElementById('resetAfterMaxStepCheckbox').checked = myGlobals.resetAfterMaxStep;

// The following properties depend on width and height defined above.
myGlobals.gridWidth = myGlobals.width / 10;
myGlobals.gridHeight = myGlobals.height / 10;

// create a renderer
var render = CustomRender.create({
    element: document.getElementById('matterDiv'),
    engine: engine,
    options: {
        width: myGlobals.width,
        height: myGlobals.height,
        background: "white",
    }
});

//console.log("width, height: " + myGlobals.width + ", " + myGlobals.height);

const ObjectTypes = {
    ROBOT: 0x0001,
    WALL: 0x0002,
    RED_PUCK: 0x0004,
    GREEN_PUCK: 0x0008,
    NEST: 0x000F,
    GOAL_ZONE:0x0010,
    //LANDMARK: 0x0020,
    NUMBER_TYPES: 6,

    ANY_PUCK: 0x000C
};

const ObjectColours = {
    [ObjectTypes.ROBOT]: "blue", //"grey",
    [ObjectTypes.WALL]: "blue",
    [ObjectTypes.RED_PUCK]: "red",
    [ObjectTypes.GREEN_PUCK]: "green",
    [ObjectTypes.NEST]: "teal",
    [ObjectTypes.GOAL_ZONE]: "cyan"
};

// Various global settings.
//engine.timing.timeScale = 0.1;

var simState = {
    // Properties are added in 'reset' below.

    // EXPERIMENTAL:
    trials: 1
};

var analyzer;

function reset(seedValue) {
    simState.step = 0;
    simState.resetTime = engine.timing.timestamp;

    Engine.clear(engine);
    World.clear(engine.world);

    Math.seedrandom(seedValue);
    createAndAddBoundary(engine.world, myGlobals);

    if (configuration == "#PRE_CLUSTER") {
        // The goal zone is a static region that can be sensed by a GoalZone sensor.
        let body = Bodies.circle(250, 250, 4*myGlobals.robotRadius, {isSensor: true, isStatic: true});
        body.render.strokeStyle = ObjectColours[ObjectTypes.GOAL_ZONE];
        body.render.fillStyle = ObjectColours[ObjectTypes.GOAL_ZONE];
        body.objectType = ObjectTypes.GOAL_ZONE;
        body.label = "GoalZone";
        body.isGoalZone = true;
        World.add(engine.world, body);
    }

    if (myGlobals.configuration != "#PHEROMONE") {
        simState.redPucks = createAndAddPucks(engine.world, myGlobals,
                                                 ObjectTypes.RED_PUCK, true);
        simState.greenPucks = createAndAddPucks(engine.world, myGlobals,
                                                ObjectTypes.GREEN_PUCK, true);
    }

    if (myGlobals.configuration == "#PHEROMONE") {
        let nestX = 250;
        let nestY = 250;

        // Add obstacles placed to get in the way for some growth points.
        let obs1 = Bodies.rectangle(250, 300, 300, 50, {isStatic: true});
        let obs2 = Bodies.circle(525, 200, 100, {isStatic: true});
        obs1.objectType = ObjectTypes.WALL;
        obs2.objectType = ObjectTypes.WALL;
        World.add(engine.world, [obs1, obs2]);

        // The location of the food source will cycle between 3 points.
        simState.growthPoints = [ {x: 75, y: 425}, 
                                  {x: 75, y: 75}, 
                                  {x: 425, y: 75} ];

        simState.greenPucks = [];

        nestX = 450;
        nestY = 450;

        simState.pheromoneGrid = getZeroGrid(myGlobals.gridWidth, myGlobals.gridHeight);

        // Create nest and its scent grid.
        simState.nest = new Nest(myGlobals, nestX, nestY, engine.world, simState.greenPucks);
        let nestI = Math.floor(myGlobals.gridWidth * nestX /myGlobals.width);
        let nestJ = Math.floor(myGlobals.gridHeight * nestY /myGlobals.height);
        simState.nestGrid = getDistanceGrid(nestI, nestJ, myGlobals.gridWidth,
                                            myGlobals.gridHeight);
    }

    if (myGlobals.configuration == "#CONSTRUCT" ||
        myGlobals.configuration == "#ENLARGED_ROBOT") {
        simState.pheromoneGrid = getZeroGrid(myGlobals.gridWidth, myGlobals.gridHeight);

        // Create nest scent grid (but no actual Nest).
        let nestX = 250;
        let nestY = 250;
        let nestI = Math.floor(myGlobals.gridWidth * nestX /myGlobals.width);
        let nestJ = Math.floor(myGlobals.gridHeight * nestY /myGlobals.height);
        simState.nestGrid = getDistanceGrid(nestI, nestJ, myGlobals.gridWidth,
                                            myGlobals.gridHeight);

        /*
        let x1 = 100
        let y1 = 250
        let x2 = 400
        let y2 = 250
        let x1_grid = Math.floor(myGlobals.gridWidth * x1 /myGlobals.width);
        let y1_grid = Math.floor(myGlobals.gridHeight * y1 /myGlobals.height);
        let x2_grid = Math.floor(myGlobals.gridWidth * x2 /myGlobals.width);
        let y2_grid = Math.floor(myGlobals.gridHeight * y2 /myGlobals.height);
        let gridA = getDistanceToSegmentGrid(myGlobals.gridWidth, myGlobals.gridHeight, x1_grid, y1_grid, x2_grid, y2_grid);
        //simState.nestGrid = gridA;

        x1 = 250
        y1 = 100
        x2 = 250 
        y2 = 400
        x1_grid = Math.floor(myGlobals.gridWidth * x1 /myGlobals.width);
        y1_grid = Math.floor(myGlobals.gridHeight * y1 /myGlobals.height);
        x2_grid = Math.floor(myGlobals.gridWidth * x2 /myGlobals.width);
        y2_grid = Math.floor(myGlobals.gridHeight * y2 /myGlobals.height);
        gridB = getDistanceToSegmentGrid(myGlobals.gridWidth, myGlobals.gridHeight, x1_grid, y1_grid, x2_grid, y2_grid);

        simState.nestGrid = combineGrids(gridA, gridB, myGlobals.gridWidth, myGlobals.gridHeight);
        */

        //myGlobals.screenshotCaptureSteps = [10, 100, 1000, 2000, 3000, 4000, 5000, 10000, 15000, 20000];
    }

    // Capture final screenshot
    //myGlobals.screenshotCaptureSteps = [myGlobals.maxStep];
    myGlobals.screenshotCaptureSteps = [];

    simState.robots = [];

    if (myGlobals.doAnalysis) {
        if (!analyzer) {
            analyzer = new Analyzer(myGlobals);
        } else {
            analyzer.reset();
        }
    }

    addMouseControl();
}

// Reset for initial creation.
reset('Seed');

engine.world.gravity.y = 0;

// Keys currently pressed
const keys = [];


////////////////////////////////////////////////////////////////////////////
// Event handling
////////////////////////////////////////////////////////////////////////////

Events.on(engine, 'tick', function(event) {
    update();
});

function update() {
    manageRobotPopulation();

    if ((simState.step % myGlobals.stepsBetweenControllerUpdates == 0) && 
        simState.step < myGlobals.maxStep) {

        for (let i=0; i<simState.robots.length; i++) {
            updateRobot(simState.robots[i]);
        }
    }

    configSpecificUpdate();

    if (myGlobals.showPheromoneGrid) {
        CustomRender.world(render, simState.robots, simState.pheromoneGrid);
    } else if (myGlobals.showNestGrid) {
        CustomRender.world(render, simState.robots, simState.nestGrid);
    } else {
        CustomRender.world(render, simState.robots);
    }

    if (myGlobals.doAnalysis && simState.step <= myGlobals.maxStep) {
        analyzer.analyze(engine.timing.timestamp-simState.resetTime, simState,
                         simState.step == myGlobals.maxStep);
    }

    // Potentially capture screnshot
    if (myGlobals.screenshotCaptureSteps.find(function(element) {
        return element == simState.step;
    })) {
    /*
    }) || (simState.step <= myGlobals.maxStep && simState.step % 10 == 0)) {
    */
        var step = simState.step 
        render.canvas.toBlob(function(blob) {
            //saveAs(blob, (step/10 + ".png").padStart(11, "0")); 
            saveAs(blob, ("trial_" + simState.trials + "_step_" + step +".png"));
        });
    }

    // Potentially reset so that the analyzer can plot a new trial.
    if (myGlobals.resetAfterMaxStep && 
        simState.step == myGlobals.maxStep &&
        simState.trials < 10)
    {
        simState.trials++;
        reset();
    }

    simState.step++;
}

function manageRobotPopulation() {
    // Create/destroy robots if the number contained in 'simState.robots' is
    // less than or greater than myGlobals.nRobots.
    if (simState.robots.length < myGlobals.nRobots) {

        if (myGlobals.configuration == "#FIREFLY") {
            // In #FIREFLY configuration we don't want new robots to be in sync
            // by default.  So we make sure we only create one new robot per
            // controller-update cycle.
            if (simState.step % myGlobals.stepsBetweenControllerUpdates != 0) {
                return;
            }
        }

        // Create one robot per time step.
        var robot = new Robot(engine.world, myGlobals);
        if (myGlobals.usingBlockly) {
            robot.controller = new BlocklyController();        
        } else { 
            //robot.controller = new TestController();
            //robot.controller = new SimpleAvoidController();
            //robot.controller = new AdvancedClusterController();
            //robot.controller = new OrbitController();
            //robot.controller = new OrbitalConstructionController();
            robot.controller = new OrbitalConstructionBiColourController();
        }
        simState.robots.push(robot);
    }
    if (simState.robots.length > myGlobals.nRobots) {
        var victim = simState.robots.pop();
        releasePuck(victim);
        World.remove(engine.world, victim.body);
    }
    let actualN = simState.robots.length;
    document.getElementById('actualPopulationText').innerHTML = actualN;
}

function configSpecificUpdate() {
    if (myGlobals.configuration == "#PHEROMONE" || 
        myGlobals.configuration == "#CONSTRUCT") 
    {
        gridDiffuseAndDecay(myGlobals, simState.pheromoneGrid);
    }

    if (myGlobals.configuration == "#PHEROMONE") {
        if (simState.greenPucks.length == 0) {
            // Choose the next growth point in the cycle.
            let point = simState.growthPoints.shift();
            simState.growthPoints.push(point);
            let newPucks = createAndAddPucks(engine.world, myGlobals,
                                             ObjectTypes.GREEN_PUCK, false, 
                                             point.x, point.y);
            // Append the new pucks to the same array, so that objects that
            // reference the greenPucks array (Nest) still have the right ref.
            Array.prototype.push.apply(simState.greenPucks, newPucks);
        }
    }
}

function updateRobot(robot) {
    var redPuckHeld = (robot.heldType == ObjectTypes.RED_PUCK);
    var greenPuckHeld = (robot.heldType == ObjectTypes.GREEN_PUCK);
    var puckHeld = redPuckHeld || greenPuckHeld;

    let sensorReadings = robot.getSensorReadings(myGlobals, simState.nestGrid,
                                                 simState.pheromoneGrid);

    // Consult the robot's controller.
    var action = robot.controller.getAction(engine.timing.timestamp,
                                            sensorReadings, redPuckHeld,
                                            greenPuckHeld);

    if (!puckHeld && action.gripperOn) {
        grabNearestPuck(robot);
    } else if (puckHeld && !action.gripperOn) {
        releasePuck(robot);
    }

    if (action.flashOn) {
        robot.flashing = true;
    } else {
        robot.flashing = false;
    }

    if (action.emitPheromone > 0) {
        let [i, j] = getGridCoords(myGlobals, robot.x, robot.y);
        // Add pheremone, but not to the outside rows/columns of the grid.
        if (i != 0 && i != myGlobals.gridWidth-1 &&
            j != 0 && j != myGlobals.gridHeight-1)
        {
            simState.pheromoneGrid[i][j] = action.emitPheromone / 10.0;
        }
    }

    robot.text = action.textMessage;

    if (!myGlobals.allowMovement) {
        action.linearSpeed = 0;
        action.angularSpeed = 0;
    }

    // Keyboard interaction: left/right turn robot, up/down move linearly.
    if (keys[37]) {
        action.angularSpeed -= myGlobals.MAX_ANGULAR_SPEED;
    } else if (keys[39]) {
        action.angularSpeed += myGlobals.MAX_ANGULAR_SPEED;
    } else if (keys[38]) {
        action.linearSpeed += myGlobals.MAX_FORWARD_SPEED;
    } else if (keys[40]) {
        action.linearSpeed -= myGlobals.MAX_FORWARD_SPEED;
    } 

    // Apply the motion command.
    var force = { x: action.linearSpeed, y: 0 };
    var rotated = Matter.Vector.rotate(force, robot.body.angle);
    Body.applyForce(robot.body, robot.body.position, rotated);
    robot.body.torque = action.angularSpeed;

    // Reset the count for all sensor readings.
    /*
    for (key in robot.sensorReadings) {
        robot.sensorReadings[key].count = 0;
    }
    */
    robot.clearSensors();
}

// We will only allow a grab if the inner sensor (red or green) detects a puck.
// Otherwise, the robot could actually grab distant pucks.
function grabbingAllowed(robot) {
    return (robot.sensors.innerRedPuck && robot.sensors.innerRedPuck.count > 0) || 
           (robot.sensors.innerGreenPuck && robot.sensors.innerGreenPuck.count > 0);
}

function grabNearestPuck(robot) {
    if (robot.holdConstraint != null)
        // A puck is already held.
        return;

    if (!grabbingAllowed(robot)) 
        return;

    // Define the attachment point for the puck.
    var rawAttachmentPoint = { x:myGlobals.robotRadius + myGlobals.puckRadius, y: 0};
    var attachmentPoint = Matter.Vector.rotate(rawAttachmentPoint, robot.body.angle);

    // Find the nearest (unheld) puck to the attachment point.  
    closestPuck = null;
    var nBodies = engine.world.bodies.length;
    var closestDist = Infinity;
    for (let i=0; i<nBodies; i++) {
        body = engine.world.bodies[i]
        if ((body.objectType & ObjectTypes.ANY_PUCK) != 0 && !body.held)
        {
            dx = body.position.x - (robot.x + attachmentPoint.x) 
            dy = body.position.y - (robot.y + attachmentPoint.y)
            dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < closestDist) {
                closestPuck = body;
                closestDist = dist;
            }
        }
    }

    if (closestPuck != null) {
        // Constraint that binds the puck to the robot.
        robot.holdConstraint = Constraint.create({
            bodyA: robot.body,
            pointA: attachmentPoint,
            bodyB: closestPuck,
            stiffness: 0.5
        });
        robot.holdConstraint.length = 0;

        // Useful for the puck to know about the constraint in some situations (e.g.
        // if absorbed by the nest).
        closestPuck.holdConstraint = robot.holdConstraint;

        closestPuck.held = true;
        robot.heldType = closestPuck.objectType;

        robot.holdConstraint.render.strokeStyle = ObjectColours[robot.heldType];

        World.add(engine.world, robot.holdConstraint);

        // When we grab a puck, we will no longer sense it.
        if (robot.heldType == ObjectTypes.RED_PUCK) {
            robot.sensors.innerRedPuck.deactivate();
        } else {
            robot.sensors.innerGreenPuck.deactivate();
        }
    } /*else {
        console.log("GRAB FAILED!");
    } */
}

function releasePuck(robot) {
    if (robot.holdConstraint == null)
        return;

    World.remove(engine.world, robot.holdConstraint);
    var puck = robot.holdConstraint.bodyB;
    puck.held = false;
    puck.holdConstraint = null;

    robot.holdConstraint = null;
    robot.heldType = 0;
}

Events.on(engine, 'collisionStart', function(event) {
    //console.log("COLLISION_START");
    handleCollisionStart(event);
})
Events.on(engine, 'collisionActive', function(event) {
    //console.log("COLLISION_ACTIVE");
    handleCollisionStart(event);
})
Events.on(engine, 'collisionEnd', function(event) {
    //console.log("COLLISION_END");
    handleCollisionEnd(event);
})

function handleCollisionStart(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        // First condition added for goal zones.  Performance impact?
        if (pair.bodyA.isGoalZone || pair.bodyB.isGoalZone) {
            if (pair.bodyA.isGoalZone && pair.bodyB.isSensor) {
                pair.bodyB.sensorParent.activate(pair.bodyA);
            } else if (pair.bodyB.isGoalZone && pair.bodyA.isSensor) {
                pair.bodyA.sensorParent.activate(pair.bodyB);
            }
        } else if (pair.bodyA.isSensor && !pair.bodyB.isSensor) {
            //activateSensor(pair.bodyA, pair.bodyB);
            pair.bodyA.sensorParent.activate(pair.bodyB);
        } else if (!pair.bodyA.isSensor && pair.bodyB.isSensor) {
            //activateSensor(pair.bodyB, pair.bodyA)
            pair.bodyB.sensorParent.activate(pair.bodyA);
        }
    }
}

function handleCollisionEnd(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        // First condition added for goal zones.  Performance impact?
        if (pair.bodyA.isGoalZone || pair.bodyB.isGoalZone) {
            if (pair.bodyA.isGoalZone && pair.bodyB.isSensor) {
                pair.bodyB.sensorParent.deactivate();
            } else if (pair.bodyB.isGoalZone && pair.bodyA.isSensor) {
                pair.bodyA.sensorParent.deactivate();
            }
        } else if (pair.bodyA.isSensor && !pair.bodyB.isSensor) {
            //deactivateSensor(pair.bodyA);
            pair.bodyA.sensorParent.deactivate();
        } else if (!pair.bodyA.isSensor && pair.bodyB.isSensor) {
            //deactivateSensor(pair.bodyB);
            pair.bodyB.sensorParent.deactivate();
        }
    }
}


////////////////////////////////////////////////////////////////////////////
// User interaction and rendering
////////////////////////////////////////////////////////////////////////////

function addMouseControl() {
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: true
                }
            }
        });

    World.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;
}

// Keyboard input
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});


////////////////////////////////////////////////////////////////////////////
// Run!
////////////////////////////////////////////////////////////////////////////

// Using Matter.Runner which means we put our main loop code within the 'tick'
// event.
var runner = Runner.create({isFixed: true});
Runner.run(runner, engine);


////////////////////////////////////////////////////////////////////////////
// Events 
////////////////////////////////////////////////////////////////////////////

//
// Blockly related
//

if (myGlobals.usingBlockly) {

    var clearButton = document.getElementById('clearButton');
    clearButton.addEventListener("click", function() {
        Blockly.mainWorkspace.clear();
    });

    var saveButton = document.getElementById('saveButton');
    saveButton.addEventListener("click", function() {
        // Get the xml for the current workspace.
        var xml = Blockly.Xml.workspaceToDom(workspace);
        var xml_text = Blockly.Xml.domToText(xml);

        var filename = document.getElementById('saveFileName').value;
        var blob = new Blob([xml_text], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    });

    function loadFile(o) {
        var fr = new FileReader();
        fr.onload = function(e) {
            var xml_text = e.target.result;
            var xml = Blockly.Xml.textToDom(xml_text);
            Blockly.Xml.domToWorkspace(xml, workspace);
        };
        fr.readAsText(o.files[0]);
    }

    var fileLoader = document.getElementById('fileLoader');
    fileLoader.addEventListener("change", function() {
        loadFile(this);
    });

    var showJSButton = document.getElementById('showJSButton');
    showJSButton.addEventListener("click", function() {
        Blockly.JavaScript.addReservedWords('code');
        var code = Blockly.JavaScript.workspaceToCode();
        alert(code);
        console.log(code);
    });

    var showXMLButton = document.getElementById('showXMLButton');
    showXMLButton.addEventListener("click", function() {
        var xml = Blockly.Xml.workspaceToDom(workspace);
        var xml_text = Blockly.Xml.domToText(xml);
        alert(xml_text);
    });

}

//
// Matter related
//

var resetButton = document.getElementById('resetButton');
resetButton.addEventListener("click", function() {
    reset('Seed');
});

var reseedAndResetButton = document.getElementById('reseedAndResetButton');
reseedAndResetButton.addEventListener("click", function() {
    reset();
});

var allowMovementCheckbox = document.getElementById('allowMovementCheckbox');
allowMovementCheckbox.addEventListener("change", function() {
    myGlobals.allowMovement = this.checked;
    //console.log("ALLOW MOVEMENT - " + this.checked);
});

var showSensorsCheckbox = document.getElementById('showSensorsCheckbox');
showSensorsCheckbox.addEventListener("change", function() {
    myGlobals.showSensors = this.checked;

    for (let i=0; i<simState.robots.length; i++) {
        let robot = simState.robots[i];
        robot.updateSensorVisibility(myGlobals.showSensors);
    }
});

document.getElementById('timeScaleSlider').oninput = function () {
    var value = document.getElementById('timeScaleSlider').value;
    if (myGlobals.configuration == "#FIREFLY") {
        myGlobals.stepsBetweenControllerUpdates = Math.round(1.0 / (value*value));
        //console.log(myGlobals.stepsBetweenControllerUpdates);
    } else {
        engine.timing.timeScale = value;
    }
    document.getElementById('timeScaleText').innerHTML = value;
}

document.getElementById('nRobotsSlider').oninput = function () {
    var value = document.getElementById('nRobotsSlider').value;
    myGlobals.nRobots = value;
    document.getElementById('nRobotsText').innerHTML = value;
}

document.getElementById('nRedPucksSlider').oninput = function () {
    var value = document.getElementById('nRedPucksSlider').value;
    myGlobals.nRedPucks = value;
    document.getElementById('nRedPucksText').innerHTML = value + 
        " (click Reset)";
}

document.getElementById('nGreenPucksSlider').oninput = function () {
    var value = document.getElementById('nGreenPucksSlider').value;
    myGlobals.nGreenPucks = value;
    document.getElementById('nGreenPucksText').innerHTML = value + 
        " (click Reset)";
}

document.getElementById('maxStepSlider').oninput = function () {
    var value = document.getElementById('maxStepSlider').value;
    myGlobals.maxStep = value;
    document.getElementById('maxStepText').innerHTML = value;
}

var clearPlotsAndResetButton = document.getElementById('clearPlotsAndResetButton');
clearPlotsAndResetButton.addEventListener("click", function() {
    simState.trials = 1;
    analyzer = null;
    reset();
});

var doAnalysisCheckbox = document.getElementById('doAnalysisCheckbox');
doAnalysisCheckbox.addEventListener("change", function() {
    myGlobals.doAnalysis = this.checked;
});

var resetAfterMaxStepCheckbox = document.getElementById('resetAfterMaxStepCheckbox');
resetAfterMaxStepCheckbox.addEventListener("change", function() {
    myGlobals.resetAfterMaxStep = this.checked;
});

document.getElementById('gridSelect').onchange = function () {
    var value = document.getElementById('gridSelect').value;
    if (value == "pheromone") {
        myGlobals.showPheromoneGrid = true;
        myGlobals.showNestGrid = false;
    } else if (value == "nest") {
        myGlobals.showPheromoneGrid = false;
        myGlobals.showNestGrid = true;
    } else {
        myGlobals.showNestGrid = false;
        myGlobals.showPheromoneGrid = false;
    }
}
