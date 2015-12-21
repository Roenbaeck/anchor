// the svg root and graph elements
var SVG, SVGLayer;
// create a singleton
var LayoutEngine = {
    // normal distance in pixels
    normalDistance: 30,
    // 4 percent damping (simulated friction)
    damping: 0.96,
    // stopping velocity is one tenth of a pixel per second
    stoppingVelocity: 0.1,
    // minimum starting velocity is a whole pixel
    minimumStartingVelocity: 1,
    // maximum starting velocity is higher (to remove "twitching" when few nodes are moving)
    maximumStartingVelocity: 5,
    // maximum - minimum starting velocity [set by init]
    startingVelocityDelta: 4,
    // calculated as 1/normalDistance^3, assuming that the repelling factor is -1 [set by init]
    attractionConstant: 0.00003703703704,
    // size of partitions in number of normal distances
    partitionFactor: 15,
    // the stiffness of the edges
    stiffness: 1,
    // when the layout has reached equilibrium
    equilibrium: true,
    // which layout function to use
    layout: null,
    // holds space partitions
    partitions: null,
    // size of partitions [set by init]
    partitionSize: 120,
    // the effect of the long range force
    longRangeEffect: 0.25,
    // fuzziness of the partition size (ranges between +/- fuzziness percentage of partition size)
    fuzziness: 0.1,
    // amount of fuzz [set by init]
    fuzz: 24,
    // current fuzz-operation, 0 for subtract, 1 for nothing, 2 for add [changes every iteration]
    fuzzing: 0,
    init: function() {
        this.layout = this.simpleLayout;
        this.attractionConstant = 1/this.normalDistance/this.normalDistance/this.normalDistance;
        this.partitionSize = this.partitionFactor * this.normalDistance;
        this.startingVelocityDelta = this.maximumStartingVelocity - this.minimumStartingVelocity;
        this.fuzz = this.partitionSize * this.fuzziness;
    },
    // use our own squaring algorithm rather than Math.pow
    square: function(value) {
        return value * value;
    },
    // measures distance between two nodes
    manhattanDistance: function(node, otherNode) {
        var d = Math.abs(otherNode.xPosition - node.xPosition) +
            Math.abs(otherNode.yPosition - node.yPosition);
        if(d > 0)
            return d;
        // move one node a pixel to the right if both nodes overlap
        node.xPosition +=1;
        return 1;
    },
    euclideanDistance: function(node, otherNode) {
        var d = Math.sqrt(this.square(otherNode.xPosition - node.xPosition) +
            this.square(otherNode.yPosition - node.yPosition));
        if(d > 0)
            return d;
        // move one node a pixel to the right if both nodes overlap
        node.xPosition +=1;
        return 1;
    },

    xStiffness: function(node, otherNode, multiplier) {
        return multiplier * (otherNode.xPosition - node.xPosition);
    },

    yStiffness: function(node, otherNode, multiplier) {
        return multiplier * (otherNode.yPosition - node.yPosition);
    },

    // x component of the repelling force formula
    xSimpleRepelling: function(node, otherNode) {
        return (node.xPosition - otherNode.xPosition) / this.square(this.manhattanDistance(node, otherNode));
    },

    // y component of the repelling force formula
    ySimpleRepelling: function(node, otherNode) {
        return (node.yPosition - otherNode.yPosition) / this.square(this.manhattanDistance(node, otherNode));
    },

    // x component of the attracting force formula
    xSimpleAttracting: function (node, otherNode) {
        return this.attractionConstant * (otherNode.xPosition - node.xPosition) *
            this.manhattanDistance(node, otherNode);
    },

    // y component of the attracting force formula
    ySimpleAttracting: function (node, otherNode) {
        return this.attractionConstant * (otherNode.yPosition - node.yPosition) *
            this.manhattanDistance(node, otherNode);
    },
    // x component of the repelling force formula
    xComplexRepelling: function(node, otherNode) {
        return (node.getCharge() + otherNode.getCharge())/2 * (node.xPosition - otherNode.xPosition) /
            this.square(this.euclideanDistance(node, otherNode));
    },

    // y component of the repelling force formula
    yComplexRepelling: function(node, otherNode) {
        return (node.getCharge() + otherNode.getCharge())/2 * (node.yPosition - otherNode.yPosition) /
            this.square(this.euclideanDistance(node, otherNode));
    },

    // x component of the attracting force formula
    xComplexAttracting: function (node, otherNode) {
        return (node.getMass() + otherNode.getMass())/2 * this.attractionConstant *
            (otherNode.xPosition - node.xPosition) * this.euclideanDistance(node, otherNode);
    },

    // y component of the attracting force formula
    yComplexAttracting: function (node, otherNode) {
        return (node.getMass() + otherNode.getMass())/2 * this.attractionConstant *
            (otherNode.yPosition - node.yPosition) * this.euclideanDistance(node, otherNode);
    },
    // create the square of influence
    createSquare: function(node, offset) {
        return {
            xMin: node.xPosition - offset,
            xMax: node.xPosition + offset,
            yMin: node.yPosition - offset,
            yMax: node.yPosition + offset
        };
    },
    // check if a node falls within the square of influence
    withinSquare: function(otherNode, square) {
        return  otherNode.xPosition >= square.xMin &&
            otherNode.xPosition <= square.xMax &&
            otherNode.yPosition >= square.yMin &&
            otherNode.yPosition <= square.yMax;
    },

    // calculate all forces and change the velocity and position of the nodes in the array
    simpleLayout: function(nodes) {
        this.equilibrium = false;

        var i, j, k, node, otherNode, edge, curvature;
        var numberOfNodes = nodes.length;
        var numberOfStoppedNodes = 0;

        // set up partitions
        this.partitions = {}; // faster than Object.create(null) for some reason
        this.fuzzing = (this.fuzzing + 1) % 3;
        var key, otherKey, partition, otherPartition, xPosition, yPosition, size;
        size = this.partitionSize - this.fuzz + this.fuzzing * this.fuzz;
        i = numberOfNodes;
        while(i--) {
            node = nodes[i];
            // count the number of stopped nodes
            if(!node.moving || node.fixed)
                numberOfStoppedNodes++;
            xPosition = Math.floor(node.xPosition / size);
            yPosition = Math.floor(node.yPosition / size);
            key = xPosition.toString();
            key += '|';
            key += yPosition.toString();
            partition = this.partitions[key];
            if(!partition) {
                partition = new Partition(node, false);
                this.partitions[key] = partition;
            }
            else {
                partition.addNode(node);
            }
        }
        var keys = Object.keys(this.partitions);
        k = keys.length;
        // calculate the velocity of the partitions
        while(k--) {
            key = keys[k];
            partition = this.partitions[key];
            j = keys.length;
            while(j--) {
                otherKey = keys[j];
                if(key !== otherKey) {
                    otherPartition = this.partitions[otherKey];
                    partition.xVelocity +=
                        otherPartition.nodes.length *
                        this.xSimpleRepelling(partition, otherPartition);
                    partition.yVelocity +=
                        otherPartition.nodes.length *
                        this.ySimpleRepelling(partition, otherPartition);
                }
            }
        }
        var energy = 0;
        k = keys.length;
        while(k--) {
            key = keys[k];
            partition = this.partitions[key];
            i = partition.nodes.length;
            while(i--) {
                node = partition.nodes[i];
                // add the long range effect from other partitions, somewhat weakened
                node.xVelocity += this.longRangeEffect * partition.xVelocity;
                node.yVelocity += this.longRangeEffect * partition.yVelocity;
                j = partition.nodes.length;
                while(j--) {
                    if(i !== j) {
                        otherNode = partition.nodes[j];
                        // for nodes in the same partition add the repelling velocity
                        node.xVelocity += this.xSimpleRepelling(node, otherNode);
                        node.yVelocity += this.ySimpleRepelling(node, otherNode);
                    }
                }
                // for edges apply bending force (straightens out edges)
                if(node.type === NodeType.EDGE && node.otherNode.visible && node.node.visible) {
                    // update the control point
                    node.controlPoint.xPosition = 2 * node.xPosition -
                        node.node.xPosition / 2 - node.otherNode.xPosition / 2;
                    node.controlPoint.yPosition = 2 * node.yPosition -
                        node.node.yPosition / 2 - node.otherNode.yPosition / 2;
                    // curvature is higher for a very bent edge (nodes close together)
                    curvature = this.stiffness / this.manhattanDistance(node.node, node.otherNode);
                    // attract the edge mid point to the control point
                    node.xVelocity -= this.xStiffness(node, node.controlPoint, curvature);
                    node.yVelocity -= this.yStiffness(node, node.controlPoint, curvature);
                }
                // for nodes, add the attracting velocity from all edges
                j = node.edges.length;
                while (j--) {
                    edge = node.edges[j];
                    if (edge.visible) {
                        node.xVelocity += this.xSimpleAttracting(node, edge) / node.edges.length;
                        node.yVelocity += this.ySimpleAttracting(node, edge) / node.edges.length;
                    }
                }
                // apply damping
                node.xVelocity *= this.damping;
                node.yVelocity *= this.damping;
                node.velocity = Math.abs(node.xVelocity) + Math.abs(node.yVelocity);
                // check to see if the node has stopped moving
                if(node.velocity <= this.stoppingVelocity) {
                    node.stop();
                    node.velocity = node.xVelocity = node.yVelocity = 0; // zero velocity
                }
                // the more nodes that have stopped, the larger the starting velocity must be
                else if(node.velocity >= this.minimumStartingVelocity +
                    this.startingVelocityDelta * numberOfStoppedNodes / numberOfNodes) {
                    node.start();
                }
                // if the node is moving and not fixed then calculate the new position
                if(node.moving && !node.fixed) {
                    energy += node.velocity;
                    node.xPosition += node.xVelocity;
                    node.yPosition += node.yVelocity;
                }
            }
        }
        if(energy < (numberOfNodes - numberOfStoppedNodes) * this.stoppingVelocity)
            this.equilibrium = true;
    },
    complexLayout: function(nodes) {
        this.equilibrium = false;

        var i, j, k, node, otherNode, edge, curvature;
        var numberOfNodes = nodes.length;
        var numberOfStoppedNodes = 0;

        // set up partitions
        this.partitions = {}; // faster than Object.create(null) for some reason
        this.fuzzing = (this.fuzzing + 1) % 3;
        var key, otherKey, partition, otherPartition, xPosition, yPosition, size;
        size = this.partitionSize - this.fuzz + this.fuzzing * this.fuzz;
        i = numberOfNodes;
        while(i--) {
            node = nodes[i];
            // count the number of stopped nodes
            if(!node.moving || node.fixed)
                numberOfStoppedNodes++;
            xPosition = Math.floor(node.xPosition / size);
            yPosition = Math.floor(node.yPosition / size);
            key = xPosition.toString();
            key += '|';
            key += yPosition.toString();
            partition = this.partitions[key];
            if(!partition) {
                partition = new Partition(node, true); // complex version
                this.partitions[key] = partition;
            }
            else {
                partition.addNode(node);
            }
        }
        var keys = Object.keys(this.partitions);
        k = keys.length;
        // calculate the velocity of the partitions
        while(k--) {
            key = keys[k];
            partition = this.partitions[key];
            j = keys.length;
            while(j--) {
                otherKey = keys[j];
                if(key !== otherKey) {
                    otherPartition = this.partitions[otherKey];
                    partition.xVelocity += this.xComplexRepelling(partition, otherPartition);
                    partition.yVelocity += this.yComplexRepelling(partition, otherPartition);
                }
            }
        }
        var energy = 0;
        k = keys.length;
        while(k--) {
            key = keys[k];
            partition = this.partitions[key];
            i = partition.nodes.length;
            while(i--) {
                node = partition.nodes[i];
                // add the long range effect from other partitions, somewhat weakened
                node.xVelocity += this.longRangeEffect * partition.xVelocity;
                node.yVelocity += this.longRangeEffect * partition.yVelocity;
                j = partition.nodes.length;
                while(j--) {
                    if(i !== j) {
                        otherNode = partition.nodes[j];
                        // for nodes in the same partition add the repelling velocity
                        node.xVelocity += this.xComplexRepelling(node, otherNode);
                        node.yVelocity += this.yComplexRepelling(node, otherNode);
                    }
                }
                // for edges apply bending force (straightens out edges)
                if(node.type === NodeType.EDGE && node.otherNode.visible && node.node.visible) {
                    // update the control point
                    node.controlPoint.xPosition = 2 * node.xPosition -
                        node.node.xPosition / 2 - node.otherNode.xPosition / 2;
                    node.controlPoint.yPosition = 2 * node.yPosition -
                        node.node.yPosition / 2 - node.otherNode.yPosition / 2;
                    // curvature is higher for a very bent edge (nodes close together)
                    curvature = this.stiffness / this.euclideanDistance(node.node, node.otherNode);
                    // attract the edge mid point to the control point
                    node.xVelocity -= this.xStiffness(node, node.controlPoint, curvature);
                    node.yVelocity -= this.yStiffness(node, node.controlPoint, curvature);
                }
                // for nodes, add the attracting velocity from all edges
                j = node.edges.length;
                while (j--) {
                    edge = node.edges[j];
                    if (edge.visible) {
                        node.xVelocity += this.xComplexAttracting(node, edge) / node.edges.length;
                        node.yVelocity += this.yComplexAttracting(node, edge) / node.edges.length;
                    }
                }
                // apply damping
                node.xVelocity *= this.damping;
                node.yVelocity *= this.damping;
                node.velocity = Math.abs(node.xVelocity) + Math.abs(node.yVelocity);
                // check to see if the node has stopped moving
                if(node.velocity <= this.stoppingVelocity) {
                    node.stop();
                    node.velocity = node.xVelocity = node.yVelocity = 0; // zero velocity
                }
                // the more nodes that have stopped, the larger the starting velocity must be
                else if(node.velocity >= this.minimumStartingVelocity +
                    this.startingVelocityDelta * numberOfStoppedNodes / numberOfNodes)
                    node.start();
                // if the node is moving and not fixed then calculate the new position
                if(node.moving && !node.fixed) {
                    energy += node.velocity;
                    node.xPosition += node.xVelocity;
                    node.yPosition += node.yVelocity;
                }
            }
        }
        if(energy < (numberOfNodes - numberOfStoppedNodes) * this.stoppingVelocity)
            this.equilibrium = true;
    }
};
