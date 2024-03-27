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

    //
    // Constants
    //

    static SVG_NS = "http://www.w3.org/2000/svg";
    
    static PRECISION = 3;

    static C = 1.1283;


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
     * The degrees of rotation will be the log10 of n
     * 1 (default) means clockwise; -1 means counter-clockwise.
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
    }


    /**
     * Make the diagram interactive
     */
    makeInteractive (advanced) {

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
                let problem_list = advanced ? ADVANCED_PROBLEMS : BASIC_PROBLEMS;
                self._problem = CardboardComputer.randomItem(problem_list).apply(self, []);
                self._showProblem(self._problem);
            }
        }

        // Add the handler for clicks/taps and keypresses
        this._nodes["slide-rule"].addEventListener("click", handler);

        // Call the handler once manually to start the process
        handler();
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

        let svgNode = CardboardComputer.makeElement("svg", {
            viewBox: this._options.viewBox ? this._options.viewBox : "0 0 1000 1000"
        });
        this._nodes["svg"] = svgNode;

        let slideRuleNode = CardboardComputer.makeElement("g", {
            class: "sliderule-diagram"
        });
        svgNode.appendChild(slideRuleNode);
        this._nodes["slide-rule"] = slideRuleNode;

        if (this._options.components.includes("outer-wheel")) {
            let outerWheelNode = CardboardComputer.makeElement("g", {
                class: "outer-wheel"
            });
            outerWheelNode.appendChild(CardboardComputer.makeElement("circle", {
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
            let innerWheelNode = CardboardComputer.makeElement("g", {
                class: "inner-wheel"
            });
            innerWheelNode.appendChild(CardboardComputer.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 420,
                stroke: "black",
                "stroke-width": 2,
                fill: "#eeeeff"
            }));
            innerWheelNode.appendChild(CardboardComputer.makeElement("text", {
                x:500,
                y: 425,
                class: "label",
                fill: "black"
            }, "The Cardboard Computer"));
            innerWheelNode.appendChild(CardboardComputer.makeElement("text", {
                x:500,
                y: 575,
                class: "label-medium",
                fill: "black"
            }, "cardboard-computer.org"));
            innerWheelNode.appendChild(CardboardComputer.makeElement("image", {
                href: "images/Public_Domain_Mark_button.svg",
                x: 460,
                y: 610,
                width: 80,
                height: 28.18
            }));
            innerWheelNode.appendChild(CardboardComputer.makeElement("text", {
                x:500,
                y: 600,
                class: "label-small",
                fill: "black"
            }, "No rights reserved."));
            slideRuleNode.appendChild(innerWheelNode);
            this._nodes["inner-wheel"] = innerWheelNode;
        }

        if (this._options.components.includes("cursor")) {
            let cursorNode = CardboardComputer.makeElement("g", {
                class: "cursor"
            });
            cursorNode.appendChild(CardboardComputer.makeElement("rect", {
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
            cursorNode.appendChild(CardboardComputer.makeElement("line", {
                x1: 500,
                x2: 500,
                y1: 40,
                y2: 535,
                opacity: "50%",
                stroke: "#aa0000",
                "stroke-width": 2
            }));
            cursorNode.appendChild(CardboardComputer.makeElement("circle", {
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
            let grommitNode = CardboardComputer.makeElement("g");
            grommitNode.appendChild(CardboardComputer.makeElement("circle", {
                class: "grommit",
                cx: 500,
                cy: 500,
                r: 30,
                fill: "#aaaaaa"
            }));
            grommitNode.appendChild(CardboardComputer.makeElement("circle", {
                cx: 500,
                cy: 500,
                r: 10,
                stroke: "black",
                "stroke-width": ".1",
                fill: "#333333"
            }));
            grommitNode.appendChild(CardboardComputer.makeElement("circle", {
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

        let scaleNode = CardboardComputer.makeElement("g", {
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
            scaleNode.appendChild(CardboardComputer.makeElement("text", {
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
                scaleNode.appendChild(CardboardComputer.makeElement("line", {
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
                        scaleNode.appendChild(CardboardComputer.makeElement("circle", {
                            fill: "#333333",
                            stroke: "#333333",
                            cx: 500,
                            cy: cy,
                            r: 15,
                            transform: rotation
                        }));
                        scaleNode.appendChild(CardboardComputer.makeElement("polygon", {
                            fill: "#333333",
                            stroke: "#333333",
                            points: "485," + cy + " 515," + cy + " 500," + (cy - 45 * scaleOpts.yDirection),
                            transform: rotation
                        }));
                    }

                    // Add the main text label
                    scaleNode.appendChild(CardboardComputer.makeElement("text", {
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
                scaleNode.appendChild(CardboardComputer.makeElement("text", {
                    x: 500,
                    y: scaleOpts.yOffset + (scaleOpts.yDirection == 1 ? 50 : -35),
                    class: scaleOpts.labelClass,
                    fill: "grey",
                    transform: rotation
                }, special.label));
                scaleNode.appendChild(CardboardComputer.makeElement("line", {
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
        document.getElementById("question").textContent = problem.q;
        this._reset();
    }


    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    _showSolution (problem) {
        document.getElementById("question").textContent = problem.a;
        this.rotate(problem.rotations, 2);
    }


    //
    // Individual problem-type methods
    //

    _setMultiplicationProblem () {
        let problem = {};
        let base = null;

        problem.n1 = Math.ceil(Math.random() * 999) / 10;
        problem.n2 = Math.ceil(Math.random() * 999) / 10;
        let result = problem.n1 * problem.n2;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["outer-wheel", problem.n1, -1],
            ["slide-rule", problem.n2, -1],
            ["cursor", problem.n2, 1]
        ];

        base = CardboardComputer.displayNum(problem.n1) + " × " + CardboardComputer.displayNum(problem.n2) + (result == problem.n3 ? " = " : " =~ ");
        problem.q = base + "?"
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (C→D scale)";

        return problem;
    }

    _setDivisionProblem () {
        let problem = {};
        let base = null;

        if (Math.random() > .9) {
            problem.n1 = Math.PI;
        } else {
            problem.n1 = Math.ceil(Math.random() * 999) / 10;
        }

        if (Math.random() > .9) {
            problem.n2 = Math.PI;
        } else {
            problem.n2 = Math.ceil(Math.random() * 999) / 10;
        }
        let result = problem.n1 / problem.n2;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["outer-wheel", problem.n1, -1],
            ["inner-wheel", problem.n2, -1],
            ["slide-rule", problem.n2, 1],
            ["cursor", problem.n2, -1]
        ];

        base = CardboardComputer.displayNum(problem.n1) + " ÷ " + CardboardComputer.displayNum(problem.n2) + (result == problem.n3 ? " = " : " =~ ");
        problem.q = base + "?"
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (C→D scale)";

        return problem;
    }


    _setSquareRootProblem () {
        let problem = {};
        let result = null;
        
        problem.n3 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n3 * problem.n3;
        problem.n1 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n3, -1],
            ["cursor", problem.n3, 1]
        ];

        let base = "√" + CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? " = " : " =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (A→C scale)";

        return problem;
    }

    
    _setSquareProblem () {
        let problem = {};
        let result = null;
        
        problem.n1 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n1 * problem.n1;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n1, -1],
            ["cursor", problem.n1, 1]
        ];

        let base = CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? "² = " : "² =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (C→A scale)";

        return problem;
    }

    
    _setCubeRootProblem () {
        let problem = {};
        let result = null;
        
        problem.n3 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n3 * problem.n3 * problem.n3;
        problem.n1 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n3, -1],
            ["cursor", problem.n3, 1]
        ];

        let base = "∛" + CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? " = " : " =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (K→C scale)";

        return problem;
    }


    _setCubeProblem () {
        let problem = {};
        let result = null;
        
        problem.n1 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n1 * problem.n1 * problem.n1;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n1, -1],
            ["cursor", problem.n1, 1]
        ];

        let base = CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? "³ = " : "³ =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " (C→K scale)";

        return problem;
    }


    _setCircleAreaProblem () {
        let problem = {};
        let result = null;

        problem.n1 = Math.ceil(Math.random() * 999) / 10.0;
        result = Math.PI * (problem.n1 / 2.0) * (problem.n1 / 2.0);
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["outer-wheel", CardboardComputer.C, -1],
            ["slide-rule", problem.n3, -2],
            ["cursor", problem.n3, 2]
        ];

        let base = "Area of a circle with diameter " + CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? " units = " : " units =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " units² (D → A scale)";

        return problem;
    }

    
    _setCircleDiameterProblem () {
        let problem = {};
        let result = null;

        problem.n3 = Math.ceil(Math.random() * 999) / 10.0;
        result = Math.PI * (problem.n3 / 2.0) * (problem.n3 / 2.0);
        problem.n1 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["outer-wheel", CardboardComputer.C, -1],
            ["slide-rule", problem.n1, -2],
            ["cursor", problem.n1, 2]
        ];

        let base = "Diameter of a circle with area " + CardboardComputer.displayNum(problem.n1) + ((problem.n3 == result) ? " units² = " : " units² =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(problem.n3) + " units (A → D scale)";

        return problem;
    }

    _setThreeFactorMultiplicationProblem () {
        let problem = {};
        let n1 = Math.ceil(Math.random() * 999) / 10.0;
        let n2 = Math.ceil(Math.random() * 999) / 10.0;
        let n3 = Math.ceil(Math.random() * 999) / 10.0;
        let result = n1 * n2 * n3;
        let n4 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["outer-wheel", n1, -1],
            ["inner-wheel", n2, 1],
            ["slide-rule", [n2, n3], -1],
            ["cursor", [n2, n3], 1],
        ];

        let base = CardboardComputer.displayNum(n1) + " × " + CardboardComputer.displayNum(n2) + " × " + CardboardComputer.displayNum(n3) + (result == n4 ? " = " : " =~ ");
        problem.q = base + "?";
        problem.a = base + CardboardComputer.displayNum(n4) + " (C → D scale)";

        return problem;
    }

    
    //
    // Static helper methods
    //

    
    /**
     * Construct a DOM element in the SVG namespace
     * Use the local name and (optionally) attributes and text content provided
     */
    static makeElement (name, atts, value) {
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
     * Choose a random item from a list.
     */
    static randomItem (l) {
        return l[Math.floor(Math.random() * l.length)];
    }


    /**
     * Display a number in human-friendly format.
     */
    static displayNum (n) {
        if (n == Math.PI) {
            return "π";
        } else {
            return n.toLocaleString();
        }
    }
    
};
