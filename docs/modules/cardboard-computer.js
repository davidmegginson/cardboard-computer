////////////////////////////////////////////////////////////////////////
// The Cardboard Computer
//
// Javascript module to draw and animate a circular slide rule.
//
// Written by David Megginson, 2024-03
// Public domain: no rights reserved
////////////////////////////////////////////////////////////////////////



//
// Constants
//

/**
 *XML Namespace for SVG
 */
export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Supports 3 significant digits
 */
export const PRECISION = 3;

/**
 * Gauge mark for circle diameter or area (simplified to 5 significant digits).
 */
export const C = 1.1283;

/**
 * Gauge mark for PI (simplified to 5 significant digits).
 */
export const PI = 3.1416



//
// Main class
//


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
 *  activateDemo - animate an interactive demo
 */
export class CardboardComputer {


    //
    // Constructor and public methods
    //


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
        this._options = options;
        this._containerNode = document.getElementById(containerId);
        this._problem = null;
        this._nodes = {};
        this._containerNode.append(this._makeSVG());
    }


    /**
     * Rotate a node around the centre of the diagram.
     *
     * Rotations are specified as a list of [nodeName, n, magnitude] entries.
     *
     * The degrees of rotation will be the log10 of n
     *
     * For the magitude, positive means clockwise.
     *
     * The duration for each rotation is specified in seconds (defaults to 0).
     *
     * Note that each node can be rotated only once (to be fixed later).
     *
     * @return The CardboardComputer object, for chaining.
     */
    rotate (rotations, duration) {

        let self = this;

        function doTransition (rotation, delay) {
            let [nodeName, n, magnitude] = rotation;

            let node = self._nodes[nodeName];
            let degrees = null;
            if (Array.isArray(n)) {
                degrees = ((Math.log10(n[0]) + Math.log10(n[1])) * 360.0 / (magnitude ? magnitude : 1.0)) % 360.0;
            } else {
                degrees = (Math.log10(n) * 360.0 / (magnitude ? magnitude : 1.0)) % 360.0;
            }

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

        if (!duration) {
            duration = 0;
        }

        let delay = 0;

        rotations.forEach((rotation) => {
            doTransition(rotation, delay);
            delay += duration;
        });

        // for chaining
        return this;
    }


    /**
     * Activate an interactive demo.
     *
     * problemContainerId: the HTML id of a container element to hold problems (usually a figure).
     *
     * @return The CardboardComputer object, for chaining.
     */
    activateDemo (problemContainerId) {

        let self = this;

        const BASIC_PROBLEMS = [
            this._setMultiplicationProblem,
            this._setDivisionProblem
        ];

        const ADVANCED_PROBLEMS = BASIC_PROBLEMS.concat([
            this._setSquareRootProblem,
            this._setSquareProblem,
            this._setCubeRootProblem,
            this._setCubeProblem,
            this._setCircleAreaProblem,
            this._setCircleDiameterProblem,
            this._setThreeFactorMultiplicationProblem
        ]);

        // Take action every time the user clicks or taps on the wheel
        function handler (e) {
            if (self._problem) {
                self._showSolution(self._problem);
                self._problem = null;
            } else {
                let problem_list = self._options.advanced ? ADVANCED_PROBLEMS : BASIC_PROBLEMS;
                self._problem = randomItem(problem_list).apply(self, []);
                self._showProblem(self._problem);
            }
        }

        if (this._isInteractive) {
            return true;
        } else {
            this._isInteractive = true;
        }

        // Find the container (should be a figure element)
        console.log(problemContainerId);
        this._problemNode = document.getElementById(problemContainerId);

        // Populate the container

        this._questionContainerNode = makeElement("div", { class: "question-container" });
        
        this._questionNode = makeElement("span", { class: "question" });
        this._questionContainerNode.appendChild(this._questionNode);

        this._helpNode = makeElement("a", { class: "help" }, "help");
        this._questionContainerNode.appendChild(this._helpNode);

        this._problemNode.appendChild(this._questionContainerNode);

        this._promptNode = makeElement("p", { class: "prompt" }, "Click or tap the wheels to continue");
        this._problemNode.appendChild(this._promptNode);

        // Add the handler for clicks/taps and keypresses
        this._nodes["slide-rule"].addEventListener("click", handler);

        // Call the handler once manually to start the process
        handler();

        // For chaining
        return this;
    }

    /**
     * Allow dragging the wheels around.
     */
    makeInteractive () {

        let draggingNode = null;

        let rect = this._nodes["slide-rule"].getBoundingClientRect();
        let centre = [
            rect.x + rect.width / 2,
            rect.y + rect.height / 2
        ];

        console.log(centre);

        function startHandler (event) {
            draggingNode = event.target.parentNode;
            console.log(draggingNode.getBoundingClientRect());
            console.log("start dragging", event, draggingNode);
        }

        function moveHandler (event) {
            if (draggingNode) {
                let x = event.x - centre[0];
                let y = centre[1] - event.y;
                let angle = Math.atan(x / y) / Math.PI * 180;
                if (y < 0) { angle = 180 + angle; }
                if (angle < 0) { angle += 360; }
                console.log(x, y, angle);
                draggingNode.style.transform = "rotate(" + angle + "deg)";
            }
        }

        function endHandler (event) {
            console.log("finish dragging", event, draggingNode);
            draggingNode = null;
        }

        for (let nodeName in this._nodes) {
            let node = this._nodes[nodeName]
            for (const child of node.children) {
                if (child.localName != "g") {
                    node.setAttribute("transform-origin", "center");
                    child.addEventListener("mousedown", startHandler);
                    child.addEventListener("mousemove", moveHandler);
                    child.addEventListener("mouseup", endHandler);
                }
            }
        }
    }
    

    
    //
    // Private methods for constructing an SVG DOM tree
    // (private by convention, not ES7 private)
    //


    /**
     * Construct the basic SVG diagram (without scales).
     * This should probably be asynchronous.
     */
    _makeSVG () {

        let svgNode = makeElementSVG("svg", {
            viewBox: this._options.viewBox ? this._options.viewBox : "0 0 1000 1000"
        });

        let slideRuleNode = makeElementSVG("g", {
            class: "sliderule-diagram"
        });
        svgNode.appendChild(slideRuleNode);
        this._nodes["slide-rule"] = slideRuleNode;

        if (this._options.components.includes("outer-wheel")) {
            let outerWheelNode = makeElementSVG("g", {
                class: "outer-wheel"
            });
            outerWheelNode.appendChild(makeElementSVG("circle", {
                cx: 500,
                cy: 500,
                r: 490,
                stroke: "black",
                "stroke-width": 2,
                fill: "white"
            }));
            slideRuleNode.appendChild(outerWheelNode);
            this._nodes["outer-wheel"] = outerWheelNode;
        }

        if (this._options.components.includes("inner-wheel")) {
            let innerWheelNode = makeElementSVG("g", {
                class: "inner-wheel"
            });
            innerWheelNode.appendChild(makeElementSVG("circle", {
                cx: 500,
                cy: 500,
                r: 420,
                stroke: "black",
                "stroke-width": 2,
                fill: "#eeeeff"
            }));
            innerWheelNode.appendChild(makeElementSVG("text", {
                x:500,
                y: 425,
                class: "label",
                fill: "black"
            }, "The Cardboard Computer"));
            innerWheelNode.appendChild(makeElementSVG("text", {
                x:500,
                y: 575,
                class: "label-medium",
                fill: "black"
            }, "cardboard-computer.org"));
            innerWheelNode.appendChild(makeElementSVG("image", {
                href: "images/Public_Domain_Mark_button.svg",
                x: 460,
                y: 610,
                width: 80,
                height: 28.18
            }));
            innerWheelNode.appendChild(makeElementSVG("text", {
                x:500,
                y: 600,
                class: "label-small",
                fill: "black"
            }, "No rights reserved."));
            slideRuleNode.appendChild(innerWheelNode);
            this._nodes["inner-wheel"] = innerWheelNode;
        }

        if (this._options.components.includes("cursor")) {
            let cursorNode = makeElementSVG("g", {
                class: "cursor"
            });
            cursorNode.appendChild(makeElementSVG("rect", {
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
            cursorNode.appendChild(makeElementSVG("line", {
                x1: 500,
                x2: 500,
                y1: 40,
                y2: 535,
                opacity: "50%",
                stroke: "#aa0000",
                "stroke-width": 2
            }));
            cursorNode.appendChild(makeElementSVG("circle", {
                cx: 500,
                cy: 500,
                r: 4,
                stroke: "black",
                fill: "black"
            }));
            slideRuleNode.appendChild(cursorNode);
            this._nodes["cursor"] = cursorNode;
        }

        if (this._options.components.includes("grommit")) {
            let grommitNode = makeElementSVG("g");
            grommitNode.appendChild(makeElementSVG("circle", {
                class: "grommit",
                cx: 500,
                cy: 500,
                r: 30,
                fill: "#aaaaaa"
            }));
            grommitNode.appendChild(makeElementSVG("circle", {
                cx: 500,
                cy: 500,
                r: 10,
                stroke: "black",
                "stroke-width": ".1",
                fill: "#333333"
            }));
            grommitNode.appendChild(makeElementSVG("circle", {
                cx: 500,
                cy: 500,
                r: 2,
                stroke: "white",
                fill: "white"
            }));
            slideRuleNode.appendChild(grommitNode);
            this._nodes["grommit"] = grommitNode;
        }

        this._draw();

        return svgNode;
    }

    /**
     * Load definitions from JSON and draw the scales as needed.
     */
    _draw () {
        fetch("data/scales.json").then((response) => response.json()).then((scales) => {
            if (this._options.components.includes("outer-wheel")) {
                this._drawScale(this._nodes["outer-wheel"], {
                    scaleLabel: "D",
                    unitPointer: true,
                    scale: scales.D,
                    yOffset: 80,
                    yDirection: -1
                });
            }
            if (this._options.components.includes("inner-wheel")) {
                this._drawScale(this._nodes["inner-wheel"], {
                    scaleLabel: "C",
                    unitPointer: true,
                    scale: scales.C,
                    yOffset: 80,
                    yDirection: 1
                });
                if (this._options.advanced) {
                    this._drawScale(this._nodes["inner-wheel"], {
                        scaleLabel: "CI",
                        scale: scales.CI,
                        yOffset: 140,
                        yDirection: 1,
                        labelClass: "label-inverse"
                    });
                    this._drawScale(this._nodes["inner-wheel"], {
                        scaleLabel: "A",
                        scale: scales.A,
                        yOffset: 200,
                        yDirection: 1,
                        labelClass: "label-medium"
                    });
                    this._drawScale(this._nodes["inner-wheel"], {
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
    _drawScale (node, scaleOpts) {

        function checkInterval (i, interval) {
            let x = Math.round(i * 1000);
            let y = Math.round(interval * 1000);
            return (x % y == 0);
        }

        function makeRotation (deg) {
            return "rotate(" + (Math.log10(deg) / scaleOpts.scale.factor) * 360.0 + ", 500, 500)";
        }

        let scaleNode = makeElementSVG("g", {
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
            scaleNode.appendChild(makeElementSVG("text", {
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
                scaleNode.appendChild(makeElementSVG("line", {
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
                        scaleNode.appendChild(makeElementSVG("circle", {
                            fill: "#333333",
                            stroke: "#333333",
                            cx: 500,
                            cy: cy,
                            r: 15,
                            transform: rotation
                        }));
                        scaleNode.appendChild(makeElementSVG("polygon", {
                            fill: "#333333",
                            stroke: "#333333",
                            points: "485," + cy + " 515," + cy + " 500," + (cy - 45 * scaleOpts.yDirection),
                            transform: rotation
                        }));
                    }

                    // Add the main text label
                    scaleNode.appendChild(makeElementSVG("text", {
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
                scaleNode.appendChild(makeElementSVG("text", {
                    x: 500,
                    y: scaleOpts.yOffset + (scaleOpts.yDirection == 1 ? 50 : -35),
                    class: scaleOpts.labelClass,
                    fill: "grey",
                    transform: rotation
                }, special.label));
                scaleNode.appendChild(makeElementSVG("line", {
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


    //
    // Private methods for creating and animating problems
    //


    /**
     * Reset the wheel to its starting position.
     */
    _reset () {
        this.rotate([
            ["slide-rule", 1, 1],
            ["outer-wheel", 1, 1],
            ["inner-wheel", 1, 1],
            ["cursor", 1, 1]
        ]);
    }


    /**
     * Show a problem without the solution
     */
    _showProblem (problem) {
        this._questionNode.textContent = problem.q;
        this._helpNode.setAttribute("href", "guide.html#" + problem.help);
        this._reset();
    }


    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    _showSolution (problem) {
        this._questionNode.textContent = problem.a;
        this.rotate(problem.rotations, 2);
    }


    //
    // Individual problem-type methods
    //

    _setMultiplicationProblem () {
        let [n1, n2] = [genNum(), genNum()];
        let result = n1 * n2;
        let base = num(n1) + " × " + num(n2) + eq(result);

        return {
            rotations: [
                ["outer-wheel", n1, -1],
                ["slide-rule", n2, -1],
                ["cursor", n2, 1]
            ],
            q: base + "?",
            a: base + num(result) + " (C→D scale)",
            help: "multiplication"
        };
    }


    _setDivisionProblem () {
        let [n1, n2] = [genNum(), genNum()];
        let result = n1 / n2;
        let base = num(n1) + " ÷ " + num(n2) + eq(result);

        return {
            rotations: [
                ["outer-wheel", n1, -1],
                ["inner-wheel", n2, -1],
                ["slide-rule", n2, 1],
                ["cursor", n2, -1]
            ],
            q: base + "?",
            a: base + num(result) + " (C→D scale)",
            help: "division"
        };
    }


    _setSquareRootProblem () {
        // work backwards from answer
        let result = genNum();
        let n1 = result ** 2;
        let base = "√" + num(n1) + eq(result);

        return {
            rotations: [
                ["slide-rule", result, -1],
                ["cursor", result, 1]
            ],
            q: base + "?",
            a: base + num(result) + " (A→C scale)",
            help: "square-roots"
        }
    }

    
    _setSquareProblem () {
        let n1 = genNum();
        let result = n1 ** 2;
        let base = num(n1) + "²" + eq(result);

        return {
            rotations: [
                ["slide-rule", n1, -1],
                ["cursor", n1, 1]
            ],
            q: base + "?",
            a: base + num(result) + " (C→A scale)",
            help: "square-roots"
        }
    }

    
    _setCubeRootProblem () {
        // work backwards from answer
        let result = genNum();
        let n1 = result ** 3;
        let base = "∛" + num(n1) + eq(result);

        return {
            rotations: [
                ["slide-rule", result, -1],
                ["cursor", result, 1]
            ],
            q: base + "?",
            a: base + num(result) + " (K→C scale)",
            help: "cube-roots"
        };
    }


    _setCubeProblem () {
        let n1 = genNum();
        let result = n1 ** 3;
        let base = num(n1) + "³" + eq(result);

        return {
            rotations: [
                ["slide-rule", n1, -1],
                ["cursor", n1, 1]
            ],
            q: base + "?",
            a: base + num(result) + " (C→K scale)",
            help: "cube-roots"
        };
    }


    _setCircleAreaProblem () {
        let n1 = genNum();
        let result = PI * (n1 / 2.0) ** 2;
        let base = "Circle diameter " + num(n1) + " units" + eq(result) + "area ";

        return {
            rotations: [
                ["outer-wheel", C, -1],
                ["slide-rule", result, -2],
                ["cursor", result, 2]
            ],
            q: base + "? units²",
            a: base + num(result) + " units² (D → A scale)",
            help: "circles.area"
        };
    }

    
    _setCircleDiameterProblem () {
        // work backwards from answer
        let result = genNum();
        let n1 = PI * (result / 2.0) ** 2;
        let base = "Circle area " + num(n1) + " units²" + eq(result) + "diameter ";
        
        return {
            rotations: [
                ["outer-wheel", C, -1],
                ["slide-rule", n1, -2],
                ["cursor", n1, 2]
            ],
            q: base + "? units",
            a: base + num(result) + " units (A → D scale)",
            help: "circles.diameter"
        };
    }

    
    _setThreeFactorMultiplicationProblem () {
        let [n1, n2, n3] = [genNum(), genNum(), genNum()];
        let result = n1 * n2 * n3;
        let base = num(n1) + " × " + num(n2) + " × " + num(n3) + eq(result);

        return {
            rotations: [
                ["outer-wheel", n1, -1],
                ["inner-wheel", n2, 1],
                ["slide-rule", [n2, n3], -1],
                ["cursor", [n2, n3], 1],
            ],
            q: base + "?",
            a: base + num(result) + " (C → D scale)",
            help: "successive-multiplication"
        };
    }

    
};



//
// Internal helper functions
//


/**
 * Construct a DOM element in the default namespace.
 */
function makeElement (name, atts, value) {
    let node = document.createElement(name);
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
 * Construct a DOM element in the SVG namespace
 * Use the local name and (optionally) attributes and text content provided
 */
function makeElementSVG (name, atts, value) {
    let node = document.createElementNS(SVG_NS, name);
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
 * Choose a random item from a list.
 */
function randomItem (l) {
    return l[Math.floor(Math.random() * l.length)];
}


/**
 * Reduce a number to PRECISION significant digits
 */
function sigDig (n) {
    return Number(n.toPrecision(PRECISION));
}

/**
 * Generate a random number for problems.
 * The number will have three significant digits, and can vary by 6 orders of magnitude.
 */
function genNum () {
    let n = Math.ceil(Math.random() * 999);
    let magnitude = Math.ceil(Math.random() * 5) - 4;
    return (n * 10 ** magnitude);
}


/**
 * Display " = " or " =~ " depending on the precision of a number.
 */
function eq (n) {
    return (sigDig(n) == n) ? " = " : " =~ ";
}


/**
 * Display a number in human-friendly format.
 */
function num (n) {
    if (n == PI) {
        return "π";
    } else {
        return sigDig(n).toLocaleString();
    }
}

// end
