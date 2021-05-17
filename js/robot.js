/*
 * This file provides methods for the creation of robots, including their
 * sensors.
 */

/*
let gridCellWidth = 100;
let lastGridX = gridCellWidth;
let lastGridY = gridCellWidth;
*/

/*
let startCircleRadius = 145;
let startCircleN = 16;
let startCircleI = 0;
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

/*
x = lastGridX;
y = lastGridY;
lastGridX = lastGridX + gridCellWidth;
if (lastGridX >= w) {
    lastGridX = gridCellWidth;
    lastGridY = lastGridY + gridCellWidth;
}
*/

/*
x = w/2 + startCircleRadius*Math.cos(startCircleI * 2*Math.PI / startCircleN);
y = h/2 + startCircleRadius*Math.sin(startCircleI * 2*Math.PI / startCircleN);
startCircleI = startCircleI + 1;
*/

        // Parts of the robot.  Each part created below will be pushed onto this list.
        let parts = [];

        // Create the main body of the robot
        this.mainBody = Bodies.circle(x, y, robotRadius);
        this.mainBody.objectType = ObjectTypes.ROBOT;
        this.mainBody.render.strokeStyle = ObjectColours[ObjectTypes.ROBOT];
        this.mainBody.render.fillStyle = ObjectColours[ObjectTypes.ROBOT];
        this.mainBody.frictionAir = myGlobals.frictionAir;
        this.mainBody.label = "Robot Main Body";
        parts.push(this.mainBody);

        if (myGlobals.configuration == "#OC2") {
            // Add a pointed wedge to the front of the robot.

            //this.wedgeBody = Body.create();
            //let vertices = [{x:0, y:robotRadius}, {x:0+3*robotRadius, y:0}, {x:0, y:-robotRadius}];
            //Matter.Vertices.create(vertices, this.wedgeBody);

            let vertices = [Vector.create(0, robotRadius), Vector.create(1.5*robotRadius, 0), Vector.create(0, -robotRadius)];

            this.wedgeBody = Bodies.fromVertices(x, y, vertices);
            Body.translate(this.wedgeBody, {x:0.75*robotRadius, y:0});

            this.wedgeBody.objectType = ObjectTypes.ROBOT;
            this.wedgeBody.render.strokeStyle = ObjectColours[ObjectTypes.ROBOT];
            this.wedgeBody.render.fillStyle = ObjectColours[ObjectTypes.ROBOT];
            this.wedgeBody.frictionAir = 0;
            this.wedgeBody.label = "Robot Wedge Body";

            parts.push(this.wedgeBody);
        }

        // Create a small massless body to indicate the orientation of the bot.
        let angleBody = Bodies.rectangle(x + 0.5*robotRadius, y, 0.9*robotRadius, 0.1*robotRadius);
        angleBody.render.opacity = 1.0;
        angleBody.render.fillStyle = "white";
        //angleBody.objectType = ObjectTypes.ROBOT;
        angleBody.label = "Robot Angle Indicator";
        angleBody.mass = 0;
        angleBody.inverseMass = Infinity;
        angleBody.density = 0;
        angleBody.frictionAir = 0;
        angleBody.inertia = 0;
        angleBody.inverseInertia = Infinity;
        parts.push(angleBody);


        this.sensors = {};

        // All configurations have left/right obstacle sensors and left/right
        // robot sensors.
        this.addSimpleObjectSensors(x, y, myGlobals, "Wall", ObjectTypes.WALL);
        this.addSimpleObjectSensors(x, y, myGlobals, "Robot",ObjectTypes.ROBOT);

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
        } else if (myGlobals.configuration == "#MAJORITY") {
            this.addMajoritySensors(x, y, myGlobals);
        } else if (myGlobals.configuration == "#PHEROMONE") {
            // Using a larger sensor for this configuration because otherwise
            // pucks are left on the edge.  A larger sensor is problematic for
            // clustering/sorting because it induces longer-distance
            // grabs/releases which can mess up clusters.
            this.addInnerGreenSensor(x, y, myGlobals, 2*myGlobals.innerSensorRadius);
        } else if (myGlobals.configuration == "#CONSTRUCT" || myGlobals.configuration == "#ENLARGED_ROBOT") {
            this.addConstructSensors(x, y, ObjectTypes.RED_PUCK, myGlobals);
            this.addConstructSensors(x, y, ObjectTypes.GREEN_PUCK, myGlobals);
        } else if (myGlobals.configuration == "#OC2") {
            this.addOC2Sensors(x, y, ObjectTypes.RED_PUCK, myGlobals);
            this.addOC2Sensors(x, y, ObjectTypes.GREEN_PUCK, myGlobals);
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
            sensorBody.render.opacity = 0.30;
            if (key == "innerGreenPuck" || key == "innerRedPuck") {
                sensorBody.render.opacity = 0.2;
            }

            // Useful for debugging.
            sensorBody.label = key
        }

        // Add the mainBody, then all sensor parts to the 'parts' array.
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
        this.textColour = "green";

        // Grid probes are represented only as relative (distance, angle) pairs
        // which which give the points at which the robot can sample the grid.
        this.gridProbes = {};
        if (myGlobals.configuration == "#PHEROMONE" ||
            myGlobals.configuration == "#CONSTRUCT" || myGlobals.configuration == "#OC2" ||
            myGlobals.configuration == "#ENLARGED_ROBOT") {
            let angle = Math.PI/4.0;
//let angle = 3.0*Math.PI/4.0;
            let distance = 2*myGlobals.robotRadius;

            this.gridProbes.leftProbe = { distance: distance, angle: -angle };
this.gridProbes.centreProbe = { distance: distance/Math.sqrt(2),
//            this.gridProbes.centreProbe = { distance: distance,
                                            angle: 0 };
            this.gridProbes.rightProbe = { distance: distance, angle: angle };
        }
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

            let noise = 0;
            //if (gp.angle > 0) {
            //    noise = 0.1 * (Math.random() - 0.5);
            //}

            sensorReadings[key] = { 
                                    nestValue: nestGrid[i][j] + noise,
                                    pheromoneValue: pheromoneGrid[i][j]
                                   };
        }

        return sensorReadings;
    }

    addSimpleObjectSensors(x, y, myGlobals, sensorName, sensedType) {
        let rr = myGlobals.robotRadius;
        let r = myGlobals.obstacleSensorSizeFactor * rr;

        // Forward shift of obstacle sensors.
        let forwardShift = 0;
        if (myGlobals.configuration == "#OC2") {
            forwardShift = 0.75*rr;
        }

        // Left sensor
        let angle = -Math.PI/4;
        let dx = (rr + r) * Math.cos(angle) + forwardShift;
        let dy = (rr + r) * Math.sin(angle);
        let leftBody = Bodies.circle(x + dx, y + dy, r, {isSensor: true});
        let leftSensorName = "left" + sensorName;
        this.sensors[leftSensorName] = new SimpleObjectSensor(leftBody, this,
                                                              sensedType);

        // Right sensor
        dx = (rr + r) * Math.cos(-angle) + forwardShift;
        dy = (rr + r) * Math.sin(-angle);
        let rightBody = Bodies.circle(x + dx, y + dy, r, {isSensor: true});
        let rightSensorName = "right" + sensorName;
        this.sensors[rightSensorName] = new SimpleObjectSensor(rightBody, this, 
                                                               sensedType);
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

    // Create the sensors used in the majority configuration.
    addMajoritySensors(x, y, myGlobals) {
        let flashSensorRadius = 3.0 * myGlobals.robotRadius;
        let flashBody = Bodies.circle(x, y, flashSensorRadius, {isSensor: true});
        this.sensors.flash = new FlashSensor(flashBody, this);

        let robotSensorBody = Bodies.circle(x, y, flashSensorRadius, {isSensor: true});
        this.sensors.robots = new SimpleObjectSensor(robotSensorBody, this, 
                                                               ObjectTypes.ROBOT);
    }

    // Create the sensors used in the construct configurations. 
    addConstructSensors(x, y, type, myGlobals) {
        let rr = myGlobals.robotRadius;
        let pr = myGlobals.puckRadius;

        let depth = rr * 4;
        let width = rr * 10;
        //let width = rr * 4;
        let chamfer = 0;
        let leftBody = Bodies.rectangle(x + rr + 1*pr + depth/2, y - width/2 - 0*pr, depth, width, {isSensor: true, chamfer: chamfer});
        if (type == ObjectTypes.RED_PUCK) {
            this.sensors.leftRedPuck = new PuckSensor(leftBody, this, type);
        } else if (type == ObjectTypes.GREEN_PUCK) {
            this.sensors.leftGreenPuck = new PuckSensor(leftBody, this, type);
        }

        // The right sensor will be shifted further to the right by this amount.
        let rightShift = 0;
        let rightBody = Bodies.rectangle(x + rr + 1*pr + depth/2, y + width/2 + 0*pr + rightShift, depth, width, {isSensor: true, chamfer: chamfer});
        if (type == ObjectTypes.RED_PUCK) {
            this.sensors.rightRedPuck = new PuckSensor(rightBody, this, type);
        } else if (type == ObjectTypes.GREEN_PUCK) {
            this.sensors.rightGreenPuck = new PuckSensor(rightBody, this, type);
        }
    }

    // Create the sensors used in the OC2 configuration. 
    addOC2Sensors(x, y, type, myGlobals) {
        let rr = myGlobals.robotRadius;
        let pr = myGlobals.puckRadius;

        // The sensors will be arcs.

        // Body of the left sensor.
        let outerRadius = 5*rr; // 10*rr;
        let vertices = [Vector.create(0, 0)];
        let angleDelta = Math.PI / 10.0;
        for (let angle = -Math.PI/2.0; angle <= 0; angle += angleDelta) {
            let u = outerRadius * Math.cos(angle);
            let v = outerRadius * Math.sin(angle);

            vertices.push(Vector.create(u, v));
        }
        let leftBody = Bodies.fromVertices(x, y, vertices, {isSensor: true});
        Body.translate(leftBody, {x:outerRadius/2.0, y:-outerRadius/2.0 + outerRadius/13.0});

        // Make it into a puck sensor of the appropriate type.
        if (type == ObjectTypes.RED_PUCK) {
            this.sensors.leftRedPuck = new PuckSensor(leftBody, this, type);
        } else if (type == ObjectTypes.GREEN_PUCK) {
            this.sensors.leftGreenPuck = new PuckSensor(leftBody, this, type);
        }
/*
        // Body of the right sensor.
        vertices = [Vector.create(0, 0)];
        for (let angle = 0; angle <= Math.PI/2.0; angle += angleDelta) {
            let u = outerRadius * Math.cos(angle);
            let v = outerRadius * Math.sin(angle);

            vertices.push(Vector.create(u, v));
        }
        let rightBody = Bodies.fromVertices(x, y, vertices, {isSensor: true});
        Body.translate(rightBody, {x:outerRadius/2.0, y:outerRadius/2.0 - outerRadius/13.0});

        if (type == ObjectTypes.RED_PUCK) {
            this.sensors.rightRedPuck = new PuckSensor(rightBody, this, type);
        } else if (type == ObjectTypes.GREEN_PUCK) {
            this.sensors.rightGreenPuck = new PuckSensor(rightBody, this, type);
        }
*/
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
        context.fillStyle = this.textColour;
        context.fillText(this.text, this.x, this.y+7);

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
        context.closePath();
    }
}
