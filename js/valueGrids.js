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

function getDistanceGrid(x, y, width, height) {
    let grid = getZeroGrid(width, height);

    let maxDistance = 0;
    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            let dx = i - x;
            let dy = j - y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance > maxDistance) {
                maxDistance = distance;
            }
            grid[i][j] = distance;
        }
    }

    // The final grid will have a value in the range [0, 1] which is inversely
    // proportional to distance.
    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            grid[i][j] = 1 - grid[i][j] / maxDistance;
        }
    }

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
