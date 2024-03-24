class CardboardComputer {

    // constants

    static SVG_NS = "http://www.w3.org/2000/svg";
    
    static PRECISION = 3;

    // private variables
    containerNode = null;

    /**
     * Construct a new cardboard computer
     */
    constructor(containerId, options) {
        if (!options) {
            options = {};
        }
        this.containerNode = document.getElementById(containerId);
        this.problem = null;
        this.containerNode.append(this.makeSVG(options));
    }

    /**
     * Construct the basic SVG diagram (without scales).
     */
    makeSVG (options) {

        this.svgNode = this.makeElement("svg", {
            viewBox: options.viewBox ? options.viewBox : "0 0 1000 1000"
        });

        this.slideRuleNode = this.makeElement("g", {
            class: "sliderule-diagram"
        });
        this.svgNode.appendChild(this.slideRuleNode);

        if (!options.components || options.components.outerWheel) {
            this.outerWheelNode = this.makeElement("g", {
                class: "outer-wheel"
            });
            this.outerWheelNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 490,
                stroke: "black",
                "stroke-width": 1,
                fill: "white"
            }));
            this.slideRuleNode.appendChild(this.outerWheelNode);
        }

        if (!options.components || options.components.innerWheel) {
            this.innerWheelNode = this.makeElement("g", {
                class: "inner-wheel"
            });
            this.innerWheelNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 420,
                stroke: "black",
                "stroke-width": 1,
                fill: "#eeeeff"
            }));
            this.slideRuleNode.appendChild(this.innerWheelNode);
        }

        if (!options.components || options.components.cursor) {
            this.cursorNode = this.makeElement("g", {
                class: "cursor"
            });
            this.cursorNode.appendChild(this.makeElement("ellipse", {
                cx: 500,
                cy: 268,
                rx: 20,
                ry: 232,
                "fill-opacity": "10%",
                fill: "black",
                stroke: "black",
                "stroke-width": 1
            }));
            this.cursorNode.appendChild(this.makeElement("line", {
                x1: 500,
                x2: 500,
                y1: 36,
                y2: 500,
                opacity: "50%",
                stroke: "#aa0000",
                "stroke-width": 1
            }));
            this.slideRuleNode.appendChild(this.cursorNode);
        }

        if (!options.components || options.components.grommit) {
            this.grommitNode = this.makeElement("g");
            this.grommitNode.appendChild(this.makeElement("circle", {
                class: "grommit",
                cx: 500,
                cy: 500,
                r: 30,
                fill: "#aaaaaa"
            }));
            this.grommitNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 10,
                stroke: "black",
                "stroke-width": ".1",
                fill: "#333333"
            }));
            this.grommitNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 2,
                stroke: "white",
                fill: "white"
            }));
            this.slideRuleNode.appendChild(this.grommitNode);
        }

        this.draw(options);

        return this.svgNode;
    }

    /**
     * Show a problem without the solution
     */
    showProblem (problem) {
        document.getElementById("question").textContent = problem.q;
        this.rotate([
            [this.slideRuleNode, 1, 0, 0],
            [this.outerWheelNode, 1, 0, 0],
            [this.innerWheelNode, 1, 0, 0],
            [this.cursorNode, 1, 0, 0]
        ]);
    }


    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    showSolution (problem) {
        document.getElementById("question").textContent = problem.a;
        if (problem.op == '×') {
            this.rotate([
                [this.outerWheelNode, problem.n1, -1, 2, 0],
                [this.slideRuleNode, problem.n2, -1, 2, 2],
                [this.cursorNode, problem.n2, 1, 2, 4]
            ]);
        } else {
            this.rotate([
                [this.outerWheelNode, problem.n1, -1, 2, 0],
                [this.innerWheelNode, problem.n2, -1, 2, 2],
                [this.slideRuleNode, problem.n2, 1, 2, 4],
                [this.cursorNode, problem.n2, -1, 2, 6]
            ]);
        }
    }


    /**
     * Generate a multiplication or division problem
     */
    setProblem () {

        const PI_CUTOFF = 9.0; // this and above means pi in the random selector

        let problem = {};

        let factor1 = Math.floor(Math.random() * 10.0);
        let factor2 = Math.floor(Math.random() * 10.0);

        let result = null;

        if (factor1 > 2 && factor1 < PI_CUTOFF) {
            factor1 = 2;
        }

        if (factor2 > 2 && factor2 < PI_CUTOFF) {
            factor2 = 2;
        }

        if (factor1 < PI_CUTOFF) {
            problem.n1 = Math.ceil(Math.random() * (10.0 ** factor1));
        } else {
            problem.n1 = Math.PI;
        }
        problem.op = null;
        if (factor2 < PI_CUTOFF) {
            problem.n2 = Math.ceil(Math.random() * (10.0 ** factor2));
        } else {
            problem.n2 = Math.PI;
        }
        problem.eq = null;
        problem.n3 = null;

        problem.n1 == 1 && problem.n1++;
        problem.n2 == 1 && problem.n2++;

        if (Math.random() >= 0.5) {
            problem.op = "×";
            result = problem.n1 * problem.n2;
        } else {
            problem.op = "÷";
            result = problem.n1 / problem.n2;
        }

        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));
        problem.eq = (result == problem.n3) ? "=" : "=~";

        // string representations
        let base = null;
        if (problem.op == "×" && problem.n1 == problem.n2) {
            base = this.displayNum(problem.n1) + "² " + problem.eq + " ";
        } else {
            base = this.displayNum(problem.n1) + " " + problem.op + " " + this.displayNum(problem.n2) + " " + problem.eq + " ";
        }
        problem.q = base + "?";
        problem.a = base + this.displayNum(problem.n3.toLocaleString());

        return problem;
    }


    /**
     * Draw a scale on the circular sliderule
     */
    drawScale (node, options) {

        function checkInterval (i, interval) {
            let x = Math.round(i * 1000);
            let y = Math.round(interval * 1000);
            return (x % y == 0);
        }

        function makeRotation (deg) {
            return "rotate(" + (Math.log10(deg) / options.scale.factor) * 360.0 + ", 500, 500)";
        }

        let scaleNode = this.makeElement("g", {
            class: "scale"
        });
        
        if (!options.yDirection) {
            options.yDirection = 1;
        }

        if (!options.labelClass) {
            options.labelClass = "label";
        }

        // Label the scale
        if (options.scaleLabel) {
            scaleNode.appendChild(this.makeElement("text", {
                x: 500,
                y: options.yOffset + (options.yDirection == 1 ? 50 : -35),
                class: options.labelClass,
                fill: "blue",
                transform: "rotate(" + (options.scale.factor < 0 ? -5 : 5) + ", 500, 500)"
            }, options.scaleLabel));
        }
        
        options.scale.ranges.forEach((range) => {
            for (let i = range.start; i < range.end; i += range.step) {
                let isLarge = checkInterval(i, range.largeTickInterval);
                let rotation = makeRotation(i);
                scaleNode.appendChild(this.makeElement("line", {
                    x1: 500,
                    x2: 500,
                    y1: options.yOffset,
                    y2: options.yOffset + (isLarge ? 30: 20) * options.yDirection,
                    stroke: "black",
                    stroke_width: (isLarge ? 2 : 1),
                    transform: rotation
                }));
                if (checkInterval(i, range.labelInterval) || i == range.start) {
                    let labelClass = options.labelClass;

                    // Is this a unit pointer?
                    if (i == 1.0 && options.unitPointer) {
                        let cy = options.yOffset - (options.yDirection == -1 ? 42.5 : -42.5);
                        labelClass = "unit-pointer";
                        scaleNode.appendChild(this.makeElement("circle", {
                            fill: "#333333",
                            stroke: "#333333",
                            cx: 500,
                            cy: cy,
                            r: 15,
                            transform: rotation
                        }));
                        scaleNode.appendChild(this.makeElement("polygon", {
                            fill: "#333333",
                            stroke: "#333333",
                            points: "485," + cy + " 515," + cy + " 500," + (cy - 45 * options.yDirection),
                            transform: rotation
                        }));
                    }

                    // Add the main text label
                    scaleNode.appendChild(this.makeElement("text", {
                        x: 500,
                        y: options.yOffset + (options.yDirection == 1 ? 50 : -35),
                        class: labelClass,
                        fill: "currentColor",
                        transform: rotation
                    }, i.toLocaleString()));
                }
            }
        });

        if (options.scale.specialValues) {
            options.scale.specialValues.forEach((special) => {
                let rotation = makeRotation(special.value);
                scaleNode.appendChild(this.makeElement("text", {
                    x: 500,
                    y: options.yOffset + (options.yDirection == 1 ? 50 : -35),
                    class: options.labelClass,
                    fill: "grey",
                    transform: rotation
                }, special.label));
                scaleNode.appendChild(this.makeElement("line", {
                    x1: 500,
                    x2: 500,
                    y1: options.yOffset,
                    y2: options.yOffset + 30 * options.yDirection,
                    stroke: "grey",
                    stroke_width: 1,
                    transform: rotation
                }));
            });
        }

        node.appendChild(scaleNode);
    }


    /**
     * Construct a DOM element in the SVG namespace
     * Use the local name and (optionally) attributes and text content provided
     */
    makeElement (name, atts, value) {
        let node = document.createElementNS(CardboardComputer.SVG_NS, name);
        if (atts) {
            for (let att in atts) {
                node.setAttribute(att, atts[att]);
            }
        }
        if (value) {
            node.textContent = value;
        }
        return node;
    }


    /**
     * Rotate a node around the centre of the diagram.
     * The degrees of rotation will be the log10 of n
     * 1 (default) means clockwise; -1 means counter-clockwise.
     */
    rotate (rotations) {

        function doTransition (rotation) {
            let [node, n, direction, duration, delay] = rotation;

            if (!direction) {
                direction = 1;
            }
            if (!duration) {
                duration = 0;
            }
            if (!delay) {
                delay = 0;
            }
            let degrees = (Math.log10(n) * 360.0 * direction) % 360.0;
            if (degrees > 180.0) {
                degrees -= 360.0;
            } else if (degrees < -180.0) {
                degrees += 360.0;
            }

            node.style.transitionDelay = delay + "s";
            node.style.transitionDuration = duration + "s";
            node.style.transitionProperty = "transform";
            node.style.transform="rotate(" + degrees + "deg)";
        }

        rotations.forEach((rotation) => {
            doTransition(rotation);
        });
    }

    displayNum (n) {
        if (n == Math.PI) {
            return "π";
        } else {
            return n.toLocaleString();
        }
    }


    /**
     * Load definitions from JSON and draw the circulate slide rule
     */
    draw (options) {
        fetch("data/scales.json").then((response) => response.json()).then((scales) => {
            if (!options.components || options.components.outerWheel) {
                this.drawScale(this.outerWheelNode, {
                    scaleLabel: "D",
                    unitPointer: true,
                    scale: scales.D,
                    yOffset: 80,
                    yDirection: -1
                });
            }
            if (!options.components || options.components.innerWheel) {
                this.drawScale(this.innerWheelNode, {
                    scaleLabel: "C",
                    unitPointer: true,
                    scale: scales.C,
                    yOffset: 80,
                    yDirection: 1
                });
                if (options.advanced) {
                    this.drawScale(this.innerWheelNode, {
                        scaleLabel: "CI",
                        scale: scales.CI,
                        yOffset: 140,
                        yDirection: 1,
                        labelClass: "label-inverse"
                    });
                    this.drawScale(this.innerWheelNode, {
                        scaleLabel: "A",
                        scale: scales.A,
                        yOffset: 200,
                        yDirection: 1,
                        labelClass: "label-medium"
                    });
                    this.drawScale(this.innerWheelNode, {
                        scaleLabel: "K",
                        scale: scales.K,
                        yOffset: 260,
                        yDirection: 1,
                        labelClass: "label-small"
                    });
                }
            }
        });
    }

    /**
     * Make the diagram interactive
     */
    makeInteractive () {

        let computer = this;

        function handler (e) {
            if (computer.problem) {
                computer.showSolution(computer.problem);
                computer.problem = null;
            } else {
                computer.problem = computer.setProblem();
                computer.showProblem(computer.problem);
            }
        }

        // Add the handler for clicks/taps and keypresses
        this.slideRuleNode.addEventListener("click", handler);

        // Call the handler once manually to start the process
        handler();
    }

};



