/*
 * This file provides methods for the creation of robots, including their
 * sensors.
 */

class Robot {
    // Creates the robot and adds it to the given world.
    constructor(world, myGlobals) {
        let robotRadius = myGlobals.robotRadius;
        let puckRadius = myGlobals.puckRadius;

        let t = myGlobals.visibleWallThickness;
        let w = myGlobals.width;
        let h = myGlobals.height;

        // Choose a random position within the walls.
        let x = Math.floor(t + robotRadius + (w - 2 * t - 2 * robotRadius) * Math.random());
        let y = Math.floor(t + robotRadius + (h - 2 * t - 2 * robotRadius) * Math.random());

        // Create the main body of the robot
        this.mainBody = Bodies.circle(x, y, robotRadius);
        this.mainBody.objectType = ObjectTypes.ROBOT;
        this.mainBody.render.strokeStyle = ObjectColours[ObjectTypes.ROBOT];
        this.mainBody.render.fillStyle = ObjectColours[ObjectTypes.ROBOT];
        this.mainBody.frictionAir = myGlobals.frictionAir;
        this.mainBody.label = "Robot Main Body";

        // Create a small massless body to indicate the orientation of the bot.
        let angleBody = Bodies.rectangle(x + 0.5*robotRadius, y, 0.9*robotRadius, 0.1*robotRadius);
        angleBody.render.opacity = 1.0;
        angleBody.render.strokeStyle = "white";
        angleBody.render.fillStyle = "white";
        angleBody.objectType = ObjectTypes.ROBOT;
        angleBody.frictionAir = myGlobals.frictionAir;
        angleBody.label = "Robot Angle Indicator";
        angleBody.mass = 0;
        angleBody.inverseMass = Infinity;
        angleBody.density = 0;
        angleBody.frictionAir = 0;
        angleBody.inertia = 0;
        angleBody.inverseInertia = Infinity;

        this.sensors = {};

        // All configurations have left/right obstacle sensors.
        this.addObstacleSensors(x, y, myGlobals);

        let pr = myGlobals.puckRadius;

        if (myGlobals.configuration == "#PRE_CLUSTER") {
            this.addGoalZoneSensor(x, y, myGlobals);
        }
        if (myGlobals.configuration == "#PRE_CLUSTER" || myGlobals.configuration == "#SIMPLE_CLUSTER") {
            this.addClusterSensors(x, y, myGlobals, false);
        } else if (myGlobals.configuration == "#ADVANCED_CLUSTER") {
            this.addClusterSensors(x, y, myGlobals, true);
        } else if (myGlobals.configuration == "#SORT") {
            this.addClusterSensors(x, y, myGlobals, false);
            this.addInnerGreenSensor(x, y, myGlobals, myGlobals.innerSensorRadius);
        } else if (myGlobals.configuration == "#FIREFLY") {
            this.addFireflySensors(x, y, myGlobals);
        } else if (myGlobals.configuration == "#PHEROMONE") {
            // Using a larger sensor for this configuration because otherwise
            // pucks are left on the edge.  A larger sensor is problematic for
            // clustering/sorting because it induces longer-distance
            // grabs/releases which can mess up clusters.
            this.addInnerGreenSensor(x, y, myGlobals, 2*myGlobals.innerSensorRadius);
        } else if (myGlobals.configuration == "#CONSTRUCT" ||
                   myGlobals.configuration == "#ENLARGED_ROBOT") {
            this.addConstructSensors(x, y, myGlobals);
        }

        // Initialize the sensor bodies
        for (let key in this.sensors) {
            let sensorBody = this.sensors[key].body;

            // Set physical properties to represent that this sensor body has no
            // impact on the robot's overall mass or inertia.
            sensorBody.mass = 0;
            sensorBody.inverseMass = Infinity;
            sensorBody.density = 0;
            sensorBody.frictionAir = 0;
            sensorBody.inertia = 0;
            sensorBody.inverseInertia = Infinity;

            // Visual properties.
            sensorBody.render.strokeStyle = "blue";
            sensorBody.render.fillStyle = "blue";
            sensorBody.render.opacity = 0.40;
            if (key == "innerGreenPuck" || key == "innerRedPuck") {
                sensorBody.render.opacity = 0.2;
            }

            // Useful for debugging.
            sensorBody.label = key
        }

        // Add the mainBody, then all sensor parts to the 'parts' array.
        let parts = [this.mainBody, angleBody]
        for (let key in this.sensors) {
            let sensorBody = this.sensors[key].body;
            parts.push(sensorBody);
        }

        this.body = Body.create({
            parts: parts
        });

        // Assign a random orientation
        Body.rotate(this.body, 2*Math.PI * Math.random());

        // Additional properties of the robot.
        this.body.frictionAir = myGlobals.frictionAir;
        this.body.label = "Robot";
        this.body.robotParent = this;
        this.holdConstraint = null;
        this.text = "";

        // Grid probes are represented only as relative (distance, angle) pairs
        // which which give the points at which the robot can sample the grid.
        this.gridProbes = {};
        if (myGlobals.configuration == "#PHEROMONE" ||
            myGlobals.configuration == "#CONSTRUCT" ||
            myGlobals.configuration == "#ENLARGED_ROBOT") {
            let angle = Math.PI/4.0;
            let distance = 2*myGlobals.robotRadius;

            this.gridProbes.leftProbe = { distance: distance, angle: -angle };
            this.gridProbes.centreProbe = { distance: distance, angle: 0 };
            this.gridProbes.rightProbe = { distance: distance, angle: angle };
        } /* else if (myGlobals.configuration == "#CONSTRUCT") {
            let angle = Math.PI/4.0;
            let distance = 2*myGlobals.robotRadius;

            this.gridProbes.leftProbe = { distance: distance, angle: Math.PI/2 - angle };
            this.gridProbes.centreProbe = { distance: distance, angle: Math.PI/2 };
            this.gridProbes.rightProbe = { distance: distance, angle: Math.PI/2 + angle };
        } */

        this.updateSensorVisibility(myGlobals.showSensors);

        World.add(world, [this.body]);
    }

    get x() {
        return this.body.position.x;
    }

    get y() {
        return this.body.position.y;
    }

    get flashing() {
        return this.mainBody.flashing;
    }

    set flashing(value) {
        this.mainBody.flashing = value;
        if (value) {
            this.mainBody.render.fillStyle = "yellow";
        } else {
            this.mainBody.render.fillStyle = ObjectColours[ObjectTypes.ROBOT];
        }
    }

    clearSensors() {
        for (let key in this.sensors) {
            this.sensors[key].reset();
        }
    }

    getSensorReadings(myGlobals, nestGrid, pheromoneGrid) {
        // Fill this robot's sensorReadings object from the collision-based
        // sensors.
        let sensorReadings = {};
        for (let key in this.sensors) {
            let count = this.sensors[key].count;
            sensorReadings[key] = { count: count };
        }

        // Complete sensorReadings with the values perceived from grid probes.
        for (let key in this.gridProbes) {
            let gp = this.gridProbes[key];

            let x = this.x + gp.distance*Math.cos(this.body.angle + gp.angle); 
            let y = this.y + gp.distance*Math.sin(this.body.angle + gp.angle); 
            let [i, j] = getGridCoords(myGlobals, x, y);

            sensorReadings[key] = { 
                                    nestValue: nestGrid[i][j],
                                    pheromoneValue: pheromoneGrid[i][j]
                                   };
        }

        return sensorReadings;
    }

    addObstacleSensors(x, y, myGlobals) {
        let rr = myGlobals.robotRadius;
        let r = myGlobals.obstacleSensorSizeFactor * rr;

        // Left sensor
        let angle = -Math.PI/4;
        let dx = (rr + r) * Math.cos(angle);
        let dy = (rr + r) * Math.sin(angle);
        let leftBody = Bodies.circle(x + dx, y + dy, r, {isSensor: true});
        this.sensors.leftObstacle = new ObstacleSensor(leftBody, this);

        // Right sensor
        dx = (rr + r) * Math.cos(-angle);
        dy = (rr + r) * Math.sin(-angle);
        let rightBody = Bodies.circle(x + dx, y + dy, r, {isSensor: true});
        this.sensors.rightObstacle = new ObstacleSensor(rightBody, this);
    }

    addGoalZoneSensor(x, y, myGlobals) {
        let r = 0.15 * myGlobals.robotRadius;
        let body = Bodies.circle(x, y, r, {isSensor: true});
        this.sensors.goalZone = new GoalZoneSensor(body, this);
    }

    // Create the sensors used in the two cluster configurations. 
    addClusterSensors(x, y, myGlobals, advanced) {
        let rr = myGlobals.robotRadius;
        let pr = myGlobals.puckRadius;

        // The inner sensor is included in both simple and advanced configs.
        let innerSensorRadius = myGlobals.innerSensorRadius;
        let innerBody = Bodies.circle(x + rr + pr, y, innerSensorRadius, {isSensor: true});
        this.sensors.innerRedPuck = new PuckSensor(innerBody, this, ObjectTypes.RED_PUCK);

        // Left and right sensors are only for the advanced config.
        if (advanced) {
            let depth = rr * 2;
            let width = rr * 2;
            let chamfer = 0;
            let leftBody = Bodies.rectangle(x + rr + 5*pr + depth/2, y - width/2 - pr, depth, width, {isSensor: true, chamfer: chamfer});
            this.sensors.leftRedPuck = new PuckSensor(leftBody, this, ObjectTypes.RED_PUCK);

            let rightBody = Bodies.rectangle(x + rr + 5*pr + depth/2, y + width/2 + pr, depth, width, {isSensor: true, chamfer: chamfer});
            this.sensors.rightRedPuck = new PuckSensor(rightBody, this, ObjectTypes.RED_PUCK);
        }
    }

    // Adds to the inner red puck sensor created in 'addClusterSensors' an
    // inner green puck sensor.
    addInnerGreenSensor(x, y, myGlobals, innerSensorRadius) {
        let rr = myGlobals.robotRadius;
        let pr = myGlobals.puckRadius;
        let innerBody = Bodies.circle(x + rr + pr, y, innerSensorRadius, {isSensor: true});
        this.sensors.innerGreenPuck = new PuckSensor(innerBody, this, ObjectTypes.GREEN_PUCK);
    }

    // Create the sensors used in the firefly configuration.
    addFireflySensors(x, y, myGlobals) {
        let flashSensorRadius = 3.0 * myGlobals.robotRadius;
        let flashBody = Bodies.circle(x, y, flashSensorRadius, {isSensor: true});
        this.sensors.flash = new FlashSensor(flashBody, this);
    }

    // Create the sensors used in the construct configurations. 
    addConstructSensors(x, y, myGlobals) {
        let rr = myGlobals.robotRadius;
        let pr = myGlobals.puckRadius;

        let depth = rr * 4;
        let width = rr * 10;
        //let width = rr * 4;
        let chamfer = 0;
        let leftBody = Bodies.rectangle(x + rr + 1*pr + depth/2, y - width/2 - 0*pr, depth, width, {isSensor: true, chamfer: chamfer});
        this.sensors.leftRedPuck = new PuckSensor(leftBody, this, ObjectTypes.RED_PUCK);

        // The right sensor will be shifted further to the right by this amount.
        let rightShift = 0;
        let rightBody = Bodies.rectangle(x + rr + 1*pr + depth/2, y + width/2 + 0*pr + rightShift, depth, width, {isSensor: true, chamfer: chamfer});
        this.sensors.rightRedPuck = new PuckSensor(rightBody, this, ObjectTypes.RED_PUCK);
    }

    updateSensorVisibility(showSensors) {
        for (let key in this.sensors) {
            this.sensors[key].body.render.visible = showSensors;
        }
        this.showExtraInfo = showSensors;
    }

    // Called by the renderer to draw additional components on top of the
    // robot.
    drawExtraInfo(context) {

        context.fillStyle = "cyan";
        context.fillText(this.text, this.x, this.y);

        if (!this.showExtraInfo) {
            return;
        }

        context.beginPath();
        for (let key in this.gridProbes) {
            let gp = this.gridProbes[key];

            let x = this.x + gp.distance*Math.cos(this.body.angle + gp.angle); 
            let y = this.y + gp.distance*Math.sin(this.body.angle + gp.angle); 
 
            context.rect(x, y, 1, 1);
        }
        context.strokeStyle = "purple";
        context.stroke();
    }
}
