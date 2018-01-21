/**
 * @file Utility functions for creating and adding objects to the world.
 * @author Andrew Vardy <av@mun.ca>
 */

/**
 * Create and add pucks to the world.
 * @param world {Object} The Matter.js world
 * @param myGlobals {Object} Set of global variables
 * @param puckType {Number} Type of pucks to add
 * @param randomPlacement {Boolean} Indicates whether to place pucks randomly
 * @param x, y {Numbers} Coordinates at which to add pucks (assuming
 *     randomPlacement is false)
 *
 * @returns a list of added pucks.
 */
function createAndAddPucks(world, myGlobals, puckType, randomPlacement, x, y) {
    let n = 0;
    let colour = ObjectColours[puckType];
    if (puckType == ObjectTypes.RED_PUCK) {
        n = myGlobals.nRedPucks;
    } else {
        n = myGlobals.nGreenPucks;
    }

    let pr = myGlobals.puckRadius;

    let t = myGlobals.visibleWallThickness;
    let w = myGlobals.width;
    let h = myGlobals.height;

    let pucks = [];
    for (let i=0; i<n; i++) {
        if (randomPlacement) {
            x = Math.floor(t + pr + (w - 2*t - 2*pr)*Math.random());
            y = Math.floor(t + pr + (h - 2*t - 2*pr)*Math.random());
        } else {
            // We add a small random displacement to each puck to avoid them
            // forming into a line.
            x += 2*(1 - Math.random());
            y += 2*(1 - Math.random());
        }
        let puck = Bodies.circle(x, y, pr);
        puck.render.strokeStyle = colour;
        puck.render.fillStyle = colour;
        puck.objectType = puckType;
        puck.frictionAir = myGlobals.frictionAir;
        puck.mass = 0.1;
        puck.held = false;

        pucks.push(puck);
    }

    World.add(world, pucks);

    return pucks;
}

/**
 * Create and add a rectangular boundary to the world.
 * @param world {Object} The Matter.js world
 * @param myGlobals {Object} Set of global variables
 */
function createAndAddBoundary(world, myGlobals) {
    let t = myGlobals.wallThickness;
    let vt = myGlobals.visibleWallThickness;
    let w = myGlobals.width;
    let h = myGlobals.height;

    // Create the outer walls
    let outerWalls = [];
    outerWalls.push( Bodies.rectangle(vt-t/2, h/2, t, h, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w-vt+t/2, h/2, t, h, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w/2, vt-t/2, w, t, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w/2, h-vt+t/2, w, t, { isStatic: true }) );
    /*
    outerWalls.push( Bodies.rectangle(-ot/2, h/2, ot, h+2*ot, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w+ot/2, h/2, ot, h+2*ot, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w/2, -ot/2, w+2*ot, ot, { isStatic: true }) );
    outerWalls.push( Bodies.rectangle(w/2, h+ot/2, w+2*ot, ot, { isStatic: true }) );
    */

    // Assign the walls an objectType
    for (let i=0; i<outerWalls.length; i++) {
        outerWalls[i].objectType = ObjectTypes.WALL;
    }

    World.add(world, outerWalls);
}