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
    width : 100,
    height : 800,
    maxStep : 4000,
    MAX_FORWARD_SPEED: 0.015,
    MAX_ANGULAR_SPEED: 0.2,
    wallThickness: 1000,
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
    allowRotation: true,
    showSensors: false,
    doAnalysis: true,
    resetAfterMaxStep: false,
    showPheromoneGrid: false,
    showNestGrid: false,
    renderSkip: 1
};
