/* 
 * Here we define sensors which are based on collisions between sensor bodies
 * and objects in the world.  Each sub-class of "Sensor" may respond in
 * different ways depending upon the object collided with (i.e. the sensed
 * object).
 */

class Sensor {
    constructor(newBody, robotParent) {
    	this._body = newBody;
        this.body.sensorParent = this;
        this.robotParent = robotParent;
		this.count = 0;
    }

    activate() {
	    this.count += 1;
    }

    deactivate() {
    }

    reset() {
    	this.count = 0;
    }

    get body() {
    	return this._body;
    }
}


class ObstacleSensor extends Sensor {
	constructor(newBody, robotParent) {
		super(newBody, robotParent);
		this.mask = ObjectTypes.ROBOT | ObjectTypes.WALL;
    }

    activate(sensedObject) {
	    // Filter the case of a sensor which is not sensitive to this object type.
	    if ((sensedObject.objectType & this.mask) == 0) {
	        return;
	    }

	    super.activate();

	    this.body.render.strokeStyle = "red";
	    this.body.render.fillStyle = "red";
	}

	deactivate() {
    	this.body.render.strokeStyle = "blue";
    	this.body.render.fillStyle = "blue";
	}
}


class PuckSensor extends Sensor {
	constructor(newBody, robotParent, puckType) {
        super(newBody, robotParent);
		this.mask = puckType;
    }

    activate(sensedObject) {
	    // Filter the case of a held puck which is invisible both to this robot as well as other robots.
	    if (sensedObject.held /*&& 
	    	(this.robotParent.holdConstraint != null && this.robotParent.holdConstraint.bodyB != sensedObject)*/)
	    {
	        return;
	    }

	    // Filter the case of a sensor which is not sensitive to this object type.
	    if ((sensedObject.objectType & this.mask) == 0) {
	        return;
	    }

	    super.activate();

	    this.body.render.strokeStyle = "red";
	    this.body.render.fillStyle = "red";
	}

	deactivate() {
    	this.body.render.strokeStyle = "blue";
    	this.body.render.fillStyle = "blue";
	}
}


class GoalZoneSensor extends Sensor {
	constructor(newBody, robotParent) {
		super(newBody, robotParent);
		this.mask = ObjectTypes.GOAL_ZONE;
    }

    activate(sensedObject) {
	    // Filter the case of a sensor which is not sensitive to this object type.
	    if ((sensedObject.objectType & this.mask) == 0) {
	        return;
	    }

	    super.activate();

	    this.body.render.strokeStyle = "red";
	    this.body.render.fillStyle = "red";
	}

	deactivate() {
    	this.body.render.strokeStyle = "blue";
    	this.body.render.fillStyle = "blue";
	}
}


class FlashSensor extends Sensor {
	constructor(newBody, robotParent) {
        super(newBody, robotParent);
    }

    activate(sensedObject) {
	    if ((sensedObject.objectType & ObjectTypes.ROBOT) == 0) {
	        return;
	    }

	    if (!sensedObject.flashing) {
	        return;
	    }

	    super.activate();

	    this.body.render.strokeStyle = "red";
	    this.body.render.fillStyle = "red";
	}

	reset() {
		super.reset();
		this.deactivate();
	}

	deactivate() {
    	this.body.render.strokeStyle = "blue";
    	this.body.render.fillStyle = "blue";
	}
}
