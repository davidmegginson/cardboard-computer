/**
 * A single instance of the Cardboard computer
 *
 * https://cardboard-computer.org
 *
 * Usage:
 *
 * let computer = new CardboardComputer(containerId, options);
 *
 * containerId - the HTML id of the container where the CardboardComputer should draw itself.
 * options - an object with options for the computer.
 *
 * Options:
 *  advanced - if true, draw the advanced computer, with the CI, A, and K scales.
 *  components - a list of components to draw ("outer-wheel", "inner-wheel", "cursor", and/or "grommit"); if absent, draw all.
 *  viewBox - the SVG viewBox to show for the computer (default: "0 0 1000 1000")
 *
 * Public methods:
 *  rotate - apply a list of rotation specifications to the computer.
 *  makeInteraction - animate an interactive demo
 */
class CardboardComputer {

    // constants

    static SVG_NS = "http://www.w3.org/2000/svg";
    
    static PRECISION = 3;

    // private variables
    containerNode = null;
    nodes = {};

    /**
     * Construct a new cardboard computer
     */
    constructor(containerId, options) {
        if (!options) {
            options = {};
        }
        if (!options.components) {
            options.components = ["outer-wheel", "inner-wheel", "cursor", "grommit"];
        }
        this.options = options;
        this.containerNode = document.getElementById(containerId);
        this.problem = null;
        this.containerNode.append(this.makeSVG());
        console.log(this.nodes);
    }

    /**
     * Construct the basic SVG diagram (without scales).
     */
    makeSVG () {

        let svgNode = this.makeElement("svg", {
            viewBox: this.options.viewBox ? this.options.viewBox : "0 0 1000 1000"
        });
        this.nodes["svg"] = svgNode;

        let slideRuleNode = this.makeElement("g", {
            class: "sliderule-diagram"
        });
        svgNode.appendChild(slideRuleNode);
        this.nodes["slide-rule"] = slideRuleNode;

        if (this.options.components.includes("outer-wheel")) {
            let outerWheelNode = this.makeElement("g", {
                class: "outer-wheel"
            });
            outerWheelNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 490,
                stroke: "black",
                "stroke-width": 2,
                fill: "white"
            }));
            slideRuleNode.appendChild(outerWheelNode);
            this.nodes["outer-wheel"] = outerWheelNode;
        }

        if (this.options.components.includes("inner-wheel")) {
            let innerWheelNode = this.makeElement("g", {
                class: "inner-wheel"
            });
            innerWheelNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 420,
                stroke: "black",
                "stroke-width": 2,
                fill: "#eeeeff"
            }));
            innerWheelNode.appendChild(this.makeElement("text", {
                x:500,
                y: 425,
                class: "label",
                fill: "black"
            }, "The Cardboard Computer"));
            innerWheelNode.appendChild(this.makeElement("text", {
                x:500,
                y: 575,
                class: "label-medium",
                fill: "black"
            }, "cardboard-computer.org"));
            innerWheelNode.appendChild(this.makeElement("image", {
                href: "images/Public_Domain_Mark_button.svg",
                x: 460,
                y: 610,
                width: 80,
                height: 28.18
            }));
            innerWheelNode.appendChild(this.makeElement("text", {
                x:500,
                y: 600,
                class: "label-small",
                fill: "black"
            }, "No rights reserved."));
            slideRuleNode.appendChild(innerWheelNode);
            this.nodes["inner-wheel"] = innerWheelNode;
        }

        if (this.options.components.includes("cursor")) {
            let cursorNode = this.makeElement("g", {
                class: "cursor"
            });
            cursorNode.appendChild(this.makeElement("rect", {
                x: 465,
                y: 40,
                width: 70,
                height: 495,
                rx: 30,
                ry: 30,
                "fill-opacity": "10%",
                fill: "black",
                stroke: "black",
                "stroke-width": 1
            }));
            cursorNode.appendChild(this.makeElement("line", {
                x1: 500,
                x2: 500,
                y1: 40,
                y2: 535,
                opacity: "50%",
                stroke: "#aa0000",
                "stroke-width": 2
            }));
            cursorNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 4,
                stroke: "black",
                fill: "black"
            }));
            slideRuleNode.appendChild(cursorNode);
            this.nodes["cursor"] = cursorNode;
        }

        if (this.options.components.includes("grommit")) {
            let grommitNode = this.makeElement("g");
            grommitNode.appendChild(this.makeElement("circle", {
                class: "grommit",
                cx: 500,
                cy: 500,
                r: 30,
                fill: "#aaaaaa"
            }));
            grommitNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 10,
                stroke: "black",
                "stroke-width": ".1",
                fill: "#333333"
            }));
            grommitNode.appendChild(this.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 2,
                stroke: "white",
                fill: "white"
            }));
            slideRuleNode.appendChild(grommitNode);
            this.nodes["grommit"] = grommitNode;
        }

        this.draw();

        return svgNode;
    }

    /**
     * Load definitions from JSON and draw the scales as needed.
     */
    draw () {
        fetch("data/scales.json").then((response) => response.json()).then((scales) => {
            if (this.options.components.includes("outer-wheel")) {
                this.drawScale(this.nodes["outer-wheel"], {
                    scaleLabel: "D",
                    unitPointer: true,
                    scale: scales.D,
                    yOffset: 80,
                    yDirection: -1
                });
            }
            if (this.options.components.includes("inner-wheel")) {
                this.drawScale(this.nodes["inner-wheel"], {
                    scaleLabel: "C",
                    unitPointer: true,
                    scale: scales.C,
                    yOffset: 80,
                    yDirection: 1
                });
                if (this.options.advanced) {
                    this.drawScale(this.nodes["inner-wheel"], {
                        scaleLabel: "CI",
                        scale: scales.CI,
                        yOffset: 140,
                        yDirection: 1,
                        labelClass: "label-inverse"
                    });
                    this.drawScale(this.nodes["inner-wheel"], {
                        scaleLabel: "A",
                        scale: scales.A,
                        yOffset: 200,
                        yDirection: 1,
                        labelClass: "label-medium"
                    });
                    this.drawScale(this.nodes["inner-wheel"], {
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
     * Draw a scale on the circular sliderule
     */
    drawScale (node, scaleOpts) {

        function checkInterval (i, interval) {
            let x = Math.round(i * 1000);
            let y = Math.round(interval * 1000);
            return (x % y == 0);
        }

        function makeRotation (deg) {
            return "rotate(" + (Math.log10(deg) / scaleOpts.scale.factor) * 360.0 + ", 500, 500)";
        }

        let scaleNode = this.makeElement("g", {
            class: "scale"
        });
        
        if (!scaleOpts.yDirection) {
            scaleOpts.yDirection = 1;
        }

        if (!scaleOpts.labelClass) {
            scaleOpts.labelClass = "label";
        }

        // Label the scale
        if (scaleOpts.scaleLabel) {
            scaleNode.appendChild(this.makeElement("text", {
                x: 500,
                y: scaleOpts.yOffset + (scaleOpts.yDirection == 1 ? 50 : -35),
                class: scaleOpts.labelClass,
                fill: "blue",
                transform: "rotate(" + (scaleOpts.scale.factor < 0 ? -5 : 5) + ", 500, 500)"
            }, scaleOpts.scaleLabel));
        }
        
        scaleOpts.scale.ranges.forEach((range) => {
            for (let i = range.start; i < range.end; i += range.step) {
                let isLarge = checkInterval(i, range.largeTickInterval);
                let rotation = makeRotation(i);
                scaleNode.appendChild(this.makeElement("line", {
                    x1: 500,
                    x2: 500,
                    y1: scaleOpts.yOffset,
                    y2: scaleOpts.yOffset + (isLarge ? 30: 20) * scaleOpts.yDirection,
                    stroke: "black",
                    stroke_width: (isLarge ? 2 : 1),
                    transform: rotation
                }));
                if (checkInterval(i, range.labelInterval) || i == range.start) {
                    let labelClass = scaleOpts.labelClass;

                    // Is this a unit pointer?
                    if (i == 1.0 && scaleOpts.unitPointer) {
                        let cy = scaleOpts.yOffset - (scaleOpts.yDirection == -1 ? 42.5 : -42.5);
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
                            points: "485," + cy + " 515," + cy + " 500," + (cy - 45 * scaleOpts.yDirection),
                            transform: rotation
                        }));
                    }

                    // Add the main text label
                    scaleNode.appendChild(this.makeElement("text", {
                        x: 500,
                        y: scaleOpts.yOffset + (scaleOpts.yDirection == 1 ? 50 : -35),
                        class: labelClass,
                        fill: "currentColor",
                        transform: rotation
                    }, i.toLocaleString()));
                }
            }
        });

        if (scaleOpts.scale.specialValues) {
            scaleOpts.scale.specialValues.forEach((special) => {
                let rotation = makeRotation(special.value);
                scaleNode.appendChild(this.makeElement("text", {
                    x: 500,
                    y: scaleOpts.yOffset + (scaleOpts.yDirection == 1 ? 50 : -35),
                    class: scaleOpts.labelClass,
                    fill: "grey",
                    transform: rotation
                }, special.label));
                scaleNode.appendChild(this.makeElement("line", {
                    x1: 500,
                    x2: 500,
                    y1: scaleOpts.yOffset,
                    y2: scaleOpts.yOffset + 30 * scaleOpts.yDirection,
                    stroke: "grey",
                    stroke_width: 1,
                    transform: rotation
                }));
            });
        }

        node.appendChild(scaleNode);
    }


    /**
     * Show a problem without the solution
     */
    showProblem (problem) {
        document.getElementById("question").textContent = problem.q;
        this.rotate([
            ["slide-rule", 1, 0, 0],
            ["outer-wheel", 1, 0, 0],
            ["inner-wheel", 1, 0, 0],
            ["cursor", 1, 0, 0]
        ]);
    }


    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    showSolution (problem) {
        document.getElementById("question").textContent = problem.a;
        if (problem.op == '×') {
            this.rotate([
                ["outer-wheel", problem.n1, -1, 2, 0],
                ["slide-rule", problem.n2, -1, 2, 2],
                ["cursor", problem.n2, 1, 2, 4]
            ]);
        } else {
            this.rotate([
                ["outer-wheel", problem.n1, -1, 2, 0],
                ["inner-wheel", problem.n2, -1, 2, 2],
                ["slide-rule", problem.n2, 1, 2, 4],
                ["cursor", problem.n2, -1, 2, 6]
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

        let computer = this;

        function doTransition (rotation) {
            let [nodeName, n, direction, duration, delay] = rotation;
            let node = computer.nodes[nodeName];

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
        this.nodes["slide-rule"].addEventListener("click", handler);

        // Call the handler once manually to start the process
        handler();
    }

};



