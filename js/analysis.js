class Analyzer {
    constructor(myGlobals) {
        this.myGlobals = myGlobals;
        let config = myGlobals.configuration;
        if (config == "#SIMPLE_CLUSTER" || config == "#ADVANCED_CLUSTER") {
            this.chart = Highcharts.chart('chartDiv', {
                            chart: { animation: false },
                            title: { text: 'Percentage Completion (PC)' },
                            yAxis: { title: { text: '' } },
                            xAxis: { title: { text: 'Time' } },
                            legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
                            series: [{ name: 'PC', data: [] }],
                            redraw: false
                        }); 
        } else if (config == "#FIREFLY") {
            this.chart = Highcharts.chart('chartDiv', {
                            chart: { animation: false },
                            title: { text: 'Number of Flashes' },
                            yAxis: { title: { text: '' } },
                            xAxis: { title: { text: 'Time' } },
                            legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
                            series: [{ name: '# Flashes', data: [] }],
                            redraw: false
                        });
        } else if (config == "#SORT") {
            this.chart = Highcharts.chart('chartDiv', {
                            chart: { animation: false },
                            title: { text: 'Percentage Completion (PC)' },
                            yAxis: { title: { text: '' } },
                            xAxis: { title: { text: 'Time' } },
                            legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
                            series: [{ name: 'PC', data: [] }],
                            redraw: false
                        });
        } else if (config == "#PHEROMONE") {
            this.chart = Highcharts.chart('chartDiv', {
                            chart: { animation: false },
                            title: { text: 'Food (Green) Pucks' },
                            yAxis: { title: { text: '' } },
                            xAxis: { title: { text: 'Time' } },
                            legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
                            series: [{ name: 'Green Pucks', data: [] }],
                            redraw: false
                        });
        } else if (config == "#CONSTRUCT") {
            // PLACEHOLDER
            this.chart = Highcharts.chart('chartDiv', {
                            chart: { animation: false },
                            title: { text: '???' },
                            yAxis: { title: { text: '' } },
                            xAxis: { title: { text: 'Time' } },
                            legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
                            series: [{ name: '???', data: [] }],
                            redraw: false
                        });
        }
                       
        // (For clustering/sorting only) The threshold distance parmater which
        // controls whether two pucks are close enough to have an edge between
        // them.
        this.puckDistanceThreshold = 4.0 * myGlobals.puckRadius;

        this.lastRedrawTimeSecs = 0;
    }

    analyze(timestamp, simState) {
        let value = 0;
        let config = myGlobals.configuration;
        if (config == "#SIMPLE_CLUSTER" || config == "#ADVANCED_CLUSTER") {
            // value = this.getSecondMoment(simState.redPucks);
            value = this.getPercentageCompletion(simState.redPucks);
        } else if (config == "#FIREFLY") {
            value = this.getNumberFlashing(simState.robots);
        } else if (config == "#SORT") {
            value = this.getPercentageCompletionSort(simState.redPucks,
                                                     simState.greenPucks);
        } else if (config == "#PHEROMONE") {
            value = simState.greenPucks.length;
        } else if (config == "#CONSTRUCT") {
            // PLACEHOLDER
            value = 0;
        }

        let timeSecs = timestamp/1000;
        if (timeSecs - this.lastRedrawTimeSecs >= 1) {
            // Add point and redraw
            this.chart.series[0].addPoint([timeSecs, value], true);
            this.lastRedrawTimeSecs = timeSecs;
        } else {
            // Add point, but defer the redraw.
            this.chart.series[0].addPoint([timeSecs, value], false);
        }
    }

    // Return the percentage completion as defined in "Cache consensus:
    // rapid object sorting by a robotic swarm".
    getPercentageCompletion(pucks) {
        let stats = this.getConnectedComponentStats(pucks);
        document.getElementById('analysisMessage').innerHTML = "# clusters: " + stats[0] + ", largest size: " + stats[1];
        return (100.0 * stats[1]) / pucks.length;
    }

    // As above only for sorting red/green pucks.
    getPercentageCompletionSort(redPucks, greenPucks) {
        let redStats = this.getConnectedComponentStats(redPucks);        
        let greenStats = this.getConnectedComponentStats(greenPucks);

        document.getElementById('analysisMessage').innerHTML = "RED: " +
            "# clusters: "+redStats[0]+", largest size: "+redStats[1] + 
            "  GREEN: " +
            "# clusters: "+greenStats[0]+", largest size: "+greenStats[1];

        let n = redPucks.length + greenPucks.length;
        return (100.0 * (redStats[1] + greenStats[1])) / n;
    }

    getConnectedComponentStats(pucks) {
        let n = pucks.length;

        // Construct the graph of pucks with edges connecting those pucks which
        // lie within 'puckDistanceThreshold' of each other.
        let graph = new jsgraphs.Graph(n);
        for (let i=0; i<n; i++) {
            for (let j=i+1; j<n; j++) {
                let dx = pucks[i].position.x - pucks[j].position.x;
                let dy = pucks[i].position.y - pucks[j].position.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.puckDistanceThreshold) {
                    graph.addEdge(i, j);
                }
            }          
        }

        let cc = new jsgraphs.ConnectedComponents(graph);
        let nComponents = cc.componentCount();

        // Figure out how many nodes belong to each component.  First create
        // an array with a count of zero for each component.
        let counts = []
        for (let i=0; i<nComponents; i++) {
            counts.push(0);
        }

        // Now go through all nodes and increment the corresponding entry
        // in counts.
        for (let v = 0; v<n; ++v) {
            counts[ cc.componentId(v) ]++;
        }

        // Finally, get the largest count.
        let largestCount = 0;
        for (let i=0; i<nComponents; i++) {
            if (counts[i] > largestCount) {
                largestCount = counts[i];
            }
        }

        return [nComponents, largestCount];
    }

    getNumberHoldingPucks(robots) {
        let numberHolding = 0;
        for (let i=0; i<simState.robots.length; i++) {
            if (robots[i].puckConstraint != null) {
                numberHolding += 1;
            }
        }
        return numberHolding;
    }

    getNumberFlashing(robots) {
        let numberFlashing = 0;
        for (let i=0; i<robots.length; i++) {
            if (robots[i].flashing) {
                numberFlashing += 1;
            }
        }
        return numberFlashing;
    }

    getSecondMoment(pucks) {
        // Find the centroid of all pucks.
        let cx = 0;
        let cy = 0;
        let n = pucks.length;
        for (let i=0; i<n; i++) {
            cx += pucks[i].position.x;
            cy += pucks[i].position.y;
        }
        if (n > 0) {
            cx /= n;
            cy /= n;
        }

        //# Show the centroid
        //#draw_square((cx, cy), 10, (255, 255, 255), 1)
        
        // Calculate second moment of all pucks, scaled by (4 * radius^2) as
        // per "Clustering Objects with Robots that Do Not Compute":
        let secMoment = 0;
        for (let i=0; i<n; i++) {
            let dx = pucks[i].position.x - cx;
            let dy = pucks[i].position.y - cy;
            secMoment += dx*dx + dy*dy;
        }
        if (n > 0) {
            secMoment /= 4.0 * myGlobals.puckRadius * myGlobals.puckRadius;
        }

        return secMoment;
    }
}
