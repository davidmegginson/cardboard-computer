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
     * Reset the wheel to its starting position.
     */
    reset () {
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
    showProblem (problem) {
        document.getElementById("question").textContent = problem.q;
        this.reset();
    }


    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    showSolution (problem) {
        document.getElementById("question").textContent = problem.a;
        this.rotate(problem.rotations, 2);
    }

    setMultiplicationProblem () {
        let problem = {};
        let base = null;

        problem.n1 = Math.ceil(Math.random() * 999) / 10;
        problem.n2 = Math.ceil(Math.random() * 999) / 10;
        let result = problem.n1 * problem.n2;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));
        console.log(result, problem);

        problem.rotations = [
            ["outer-wheel", problem.n1, -1],
            ["slide-rule", problem.n2, -1],
            ["cursor", problem.n2, 1]
        ];

        base = this.displayNum(problem.n1) + " × " + this.displayNum(problem.n2) + (result == problem.n3 ? " = " : " =~ ");
        problem.q = base + "?"
        problem.a = base + this.displayNum(problem.n3) + " (C→D scale)";

        return problem;
    }

    setDivisionProblem () {
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
        console.log(result, problem);

        problem.rotations = [
            ["outer-wheel", problem.n1, -1],
            ["inner-wheel", problem.n2, -1],
            ["slide-rule", problem.n2, 1],
            ["cursor", problem.n2, -1]
        ];

        base = this.displayNum(problem.n1) + " ÷ " + this.displayNum(problem.n2) + (result == problem.n3 ? " = " : " =~ ");
        problem.q = base + "?"
        problem.a = base + this.displayNum(problem.n3) + " (C→D scale)";

        return problem;
    }


    setSquareRootProblem () {
        let problem = {};
        let result = null;
        
        problem.n3 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n3 * problem.n3;
        problem.n1 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n3, -1],
            ["cursor", problem.n3, 1]
        ];

        let base = "√" + this.displayNum(problem.n1) + ((problem.n3 == result) ? " = " : " =~ ");
        problem.q = base + "?";
        problem.a = base + this.displayNum(problem.n3) + " (A→C scale)";

        console.log(problem);

        return problem;
    }

    
    setSquareProblem () {
        let problem = {};
        let result = null;
        
        problem.n1 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n1 * problem.n1;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n1, -1],
            ["cursor", problem.n1, 1]
        ];

        let base = this.displayNum(problem.n1) + ((problem.n3 == result) ? "² = " : "² =~ ");
        problem.q = base + "?";
        problem.a = base + this.displayNum(problem.n3) + " (C→A scale)";

        console.log(problem);

        return problem;
    }

    
    setCubeRootProblem () {
        let problem = {};
        let result = null;
        
        problem.n3 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n3 * problem.n3 * problem.n3;
        problem.n1 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n3, -1],
            ["cursor", problem.n3, 1]
        ];

        let base = "∛" + this.displayNum(problem.n1) + ((problem.n3 == result) ? " = " : " =~ ");
        problem.q = base + "?";
        problem.a = base + this.displayNum(problem.n3) + " (K→C scale)";

        console.log(problem);

        return problem;
    }


    setCubeProblem () {
        let problem = {};
        let result = null;
        
        problem.n1 = Math.ceil(Math.random() * 999) / 10.0;
        result = problem.n1 * problem.n1 * problem.n1;
        problem.n3 = Number(result.toPrecision(CardboardComputer.PRECISION));

        problem.rotations = [
            ["slide-rule", problem.n1, -1],
            ["cursor", problem.n1, 1]
        ];

        let base = this.displayNum(problem.n1) + ((problem.n3 == result) ? "³ = " : "³ =~ ");
        problem.q = base + "?";
        problem.a = base + this.displayNum(problem.n3) + " (C→K scale)";

        console.log(problem);

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
    rotate (rotations, duration) {

        let computer = this;

        function doTransition (rotation, delay) {
            let [nodeName, n, direction] = rotation;
            let node = computer.nodes[nodeName];
            let degrees = (Math.log10(n) * 360.0 * (direction ? direction : 1)) % 360.0;

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
    makeInteractive (advanced) {

        let computer = this;

        function handler (e) {
            if (computer.problem) {
                computer.showSolution(computer.problem);
                computer.problem = null;
            } else {
                if (advanced) {
                    switch (Math.ceil(Math.random() * 5)) {
                    case 1:
                        computer.problem = computer.setSquareRootProblem();
                        break;
                    case 2:
                        computer.problem = computer.setSquareProblem();
                        break;
                    case 3:
                        computer.problem = computer.setCubeRootProblem();
                        break;
                    case 4:
                        computer.problem = computer.setCubeProblem();
                        break;
                    case 5:
                        computer.problem = computer.setMultiplicationProblem();
                        break;
                    case 6:
                        computer.problem = computer.setDivisionProblem();
                        break;
                    }
                } else {
                    switch (Math.ceil(Math.random() * 2)) {
                    case 1:
                        computer.problem = computer.setMultiplicationProblem();
                        break;
                    case 2:
                        computer.problem = computer.setDivisionProblem();
                        break;
                    }
                }
                computer.showProblem(computer.problem);
            }
        }

        // Add the handler for clicks/taps and keypresses
        this.nodes["slide-rule"].addEventListener("click", handler);

        // Call the handler once manually to start the process
        handler();
    }

};
