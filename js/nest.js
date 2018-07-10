/**
 * The nest is dealt with as a sensor, although it is not attached to a robot
 * like other sensors.  The nest is responsible for adding itself to the world
 * and for removing green pucks that collide with it.
 */

class Nest extends Sensor {
    constructor(myGlobals, x, y, world, greenPucks) {
        let r = 2*myGlobals.robotRadius;

        let colour = ObjectColours[ObjectTypes.NEST];

        let body = Bodies.circle(x, y, r, {isSensor: true, isStatic: true});

        body.render.strokeStyle = colour;
        body.render.fillStyle = colour;
        body.objectType = ObjectTypes.NEST;
        body.label = "Nest";

        super(body);

        this.mask = ObjectTypes.GREEN_PUCK;
        this.colour = colour;

        // Keep track of this list so that we can remove the green pucks when they hit the nest.
        this.greenPucks = greenPucks;
        this.world = world;

        World.add(world, this.body);
    }

    activate(sensedObject) {
        // Filter the case of a sensor which is not sensitive to this object type.
        if ((sensedObject.objectType & this.mask) == 0) {
            return;
        }

        super.activate();

        // We are absorbing this puck.  If there is a hold constraint update the robot
        // at the other end of it, then remove the constraint.  Then remove the puck
        // and update the 'greenPucks' array.
        if (sensedObject.holdConstraint) {
            let robot = sensedObject.holdConstraint.bodyA.robotParent;
            if (robot) {
                robot.holdConstraint = null;
                robot.heldType = 0;
                World.remove(this.world, sensedObject.holdConstraint);
            }
        }
        World.remove(this.world, sensedObject);
        this.greenPucks.splice( this.greenPucks.indexOf(sensedObject), 1 );

        this.body.render.strokeStyle = "red";
        this.body.render.fillStyle = "red";
    }

    deactivate() {
        this.body.render.strokeStyle = this.colour;
        this.body.render.fillStyle = this.colour;
    }
}
