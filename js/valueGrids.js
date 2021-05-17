/**
 * Useful functions related to creating and managing the pheremone and nest
 * grids.
 */

function getGridCoords(myGlobals, x, y) {
    let i = Math.floor(myGlobals.gridWidth * x / myGlobals.width);
    let j = Math.floor(myGlobals.gridHeight * y / myGlobals.height);

    // Cap to valid grid indices.
    if (i < 0) i = 0;
    if (i >= myGlobals.gridWidth) i = myGlobals.gridWidth-1;
    if (j < 0) j = 0;
    if (j >= myGlobals.gridHeight) j = myGlobals.gridHeight-1;

    return [i, j];
}

function getZeroGrid(width, height) {
    let grid = [];
    for (let i=0; i<width; i++) {
        let column = [];
        for (let j=0; j<height; j++) {
            column.push(0);
        }
        grid.push(column);
    }
    return grid;
}

function normalizeGrid(grid, width, height) {
    let maxDistance = 0;
    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            let distance = grid[i][j]
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
    }

    // The final grid will have a value in the range [0, 1] which is inversely
    // proportional to distance.
    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            grid[i][j] = 1 - grid[i][j] / maxDistance;
            //grid[i][j] = grid[i][j] / maxDistance;
        }
    }
}

function getDistanceGrid(cx, cy, width, height) {
    let grid = getZeroGrid(width, height);

    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            let dx = i - cx;
            let dy = j - cy;
            let distance = Math.sqrt(dx*dx + dy*dy);
            grid[i][j] = distance;
        }
    }

    normalizeGrid(grid, width, height);

    return grid;
}

/* The grid returned will be binary with the probability of 0 (black) or 1
(white) dependent on the distance to the source point at (cx, cy). */
function getRandomizedDistanceGrid(cx, cy, width, height) {
    let grid = getZeroGrid(width, height);

    let maxDistance = Math.sqrt( Math.pow( Math.max(cx, width - cx - 1), 2)
                               + Math.pow( Math.max(cy, width - cy - 1), 2));

    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            let dx = i - cx;
            let dy = j - cy;
            let distance = Math.sqrt(dx*dx + dy*dy);

            let probability = distance / maxDistance;
            if (Math.random() > probability) {
                grid[i][j] = 1;
            } else {
                grid[i][j] = 0;
            }
        }
    }

    return grid;
}


// Get the distances to the line segment specified by points (x1, y1) and (x2,
// y2).  Uses functions defined in distToSegment.js.
function getDistanceToSegmentGrid(width, height, x1, y1, x2, y2) {
    let grid = getZeroGrid(width, height);

    v = { x: x1, y: y1 };
    w = { x: x2, y: y2 };

    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            p = { x: i, y: j };
            grid[i][j] = distToSegment(p, v, w)
        }
    }

    normalizeGrid(grid, width, height);

    return grid;
}

function combineGrids(gridA, gridB, width, height) {
    let grid = getZeroGrid(width, height);

    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            grid[i][j] = 1.0 - Math.max(gridA[i][j], gridB[i][j])
        }
    }

    normalizeGrid(grid, width, height);

    return grid;
}


function gridDiffuseAndDecay(myGlobals, grid) {
    var oldGrid = grid.slice(0);
    var w = grid.length;
    var h = grid[0].length;

    var diffuse = myGlobals.pheromoneDiffusionRate;
    var decay = myGlobals.pheromoneDecayRate;

    for (let i=1; i<w-1; i++) {
        for (let j=1; j<h-1; j++) {
            let newValue = 0;
            for (let dx=-1; dx<=1; dx++) {
                for (let dy=-1; dy<=1; dy++) {
                    if (dx==0 && dy==0) {
                        newValue += (1.0 - diffuse) * oldGrid[i+dx][j+dy];
                    } else {
                        newValue += (diffuse / 8.0) * oldGrid[i+dx][j+dy];
                    }
                }
            }
            grid[i][j] = (1-decay) * newValue;
        }
    }
}
