window.onload = () => {

    const SVG_NS = "http://www.w3.org/2000/svg";
    const PRECISION = 3;
    const USE_INVERSE = true;
    const LOG10_SCALE = {
        func: Math.log10,
        ranges: [
            {
                start: 1,
                end: 2,
                step: 0.01,
                largeTickInterval: 0.05,
                labelInterval: 0.1
            },
            {
                start: 2,
                end: 5,
                step: 0.02,
                largeTickInterval: 0.1,
                labelInterval: 0.5
            },
            {
                start: 5,
                end: 10,
                step: 0.05,
                largeTickInterval: 0.1,
                labelInterval: 0.5
            }
        ]
    }

    function drawScale (node, scale, yOffset, yDirection, rDirection) {
        function checkInterval (i, interval) {
            let x = Math.round(i * 1000);
            let y = Math.round(interval * 1000);
            return (x % y == 0);
        }
        
        if (!yDirection) {
            yDirection = 1;
        }
        if (!rDirection) {
            rDirection = 1;
        }
        scale.ranges.forEach((range) => {
            console.log(range);
            for (let i = range.start; i < range.end; i += range.step) {
                let isLarge = checkInterval(i, range.largeTickInterval);
                let rotation = "rotate(" + (scale.func(i) * 360.0 * rDirection) + ", 500, 500)";
                node.appendChild(makeElement("line", {
                    x1: 500,
                    x2: 500,
                    y1: yOffset,
                    y2: yOffset + (isLarge ? 30: 20) * yDirection,
                    stroke: "black",
                    stroke_width: (isLarge ? 2 : 1),
                    transform: rotation
                }));
                if (checkInterval(i, range.labelInterval)) {
                    node.appendChild(makeElement("text", {
                        x: 500,
                        y: yOffset + (yDirection == 1 ? 50 : -35),
                        class: "label",
                        transform: rotation
                    }, i.toLocaleString()));
                }
            }
        });
    }

    /**
     * Construct a DOM element in the SVG namespace
     * Use the local name and (optionally) attributes and text content provided
     */
    function makeElement (name, atts, value) {
        node = document.createElementNS(SVG_NS, name);
        if (atts) {
            for (att in atts) {
                node.setAttribute(att, atts[att]);
            }
        }
        if (value) {
            node.textContent = value;
        }
        return node;
    }

    
    /**
     * Construct a rotation transformation string
     * n is the rotation in degrees
     * Currently 500,500 is hardcoded as the centre.
     */
    /**
     * Rotate a node around its centre.
     * The degrees of rotation will be the log10 of n
     * 1 (default) means clockwise; -1 means counter-clockwise.
     */
    function rotate (node, n, direction, duration, delay) {
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
        node.style.transform="rotate(" + degrees + "deg)";
    }


    /**
     * Generate a multiplication or division problem
     */
    function setProblem () {

        let problem = {};

        // TODO problems with pi
        let factor1 = Math.floor(Math.random() * 10.0);
        let factor2 = Math.floor(Math.random() * 10.0);

        let result = null;

        if (factor1 > 2) {
            factor1 = 2;
        }

        if (factor2 > 2) {
            factor2 = 2;
        }

        problem.n1 = Math.ceil(Math.random() * (10.0 ** factor1));
        problem.op = null;
        problem.n2 = Math.ceil(Math.random() * (10.0 ** factor2));
        problem.eq = null;
        problem.n3 = null;

        problem.n1 == 1 && problem.n1++;
        problem.n2 == 1 && problem.n2++;

        if (Math.random() >= 0.5) {
            problem.op = "×";
            result = problem.n1 * problem.n2;
        } else {
            problem.op = "÷";
//            if (problem.n1 < problem.n2) {
//                [problem.n1, problem.n2] = [problem.n2, problem.n1];
//            }
            result = problem.n1 / problem.n2;
        }

        problem.n3 = Number(result.toPrecision(PRECISION));
        problem.eq = (result == problem.n3) ? "=" : "=~";

        return problem;
    }


    /**
     * Show a problem without the solution
     */
    function showProblem (problem) {
        document.getElementById("n1").textContent = problem.n1.toLocaleString();
        document.getElementById("op").textContent = problem.op;
        document.getElementById("n2").textContent = problem.n2.toLocaleString();
        document.getElementById("eq").textContent = problem.eq;
        document.getElementById("n3").textContent = "?";
        rotate(slideRuleNode, 1, 0, 0);
        rotate(outerWheelNode, 1, 0, 0);
        rotate(cursorNode, 1, 0, 0);
    }

    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    function showSolution (problem) {
        document.getElementById("n3").textContent = problem.n3.toLocaleString();
        if (problem.op == '×') {
            rotate(outerWheelNode, problem.n1, -1, 2, 0);
            rotate(cursorNode, problem.n2, 1, 2, 2);
            rotate(slideRuleNode, problem.n2, -1, 2, 4);
        } else {
            rotate(cursorNode, problem.n2, 1, 2, 0);
            rotate(outerWheelNode, problem.n3, -1, 2, 2);
        }
    }


    // Set up variables
    let slideRuleNode = document.getElementById("sliderule-diagram");
    let outerWheelNode = document.getElementById("outer-wheel");
    let outerWheelScaleNode = document.getElementById("outer-scale");
    let innerWheelNode = document.getElementById("inner-wheel");
    let innerWheelScaleNode = document.getElementById("inner-scale");
    let inverseScaleNode = document.getElementById("inverse-scale");
    let cursorNode = document.getElementById("cursor");
    let problem = null;

    /**
     * React to a user action by showing a new problem or a solution.
     */
    function handler (e) {
        if (problem) {
            showSolution(problem);
            problem = null;
        } else {
            problem = setProblem();
            showProblem(problem);
        }
    }

    function makeInteractive () {
        // Add the handler for clicks/taps and keypresses
        window.addEventListener("click", handler);
        window.addEventListener("keypress", handler);

        // Call the handler once manually to start the process
        handler();
    }

    // Draw the scales on the wheels
    drawScale(outerWheelScaleNode, LOG10_SCALE, 80, -1, 1);
    drawScale(innerWheelScaleNode, LOG10_SCALE, 80, 1, 1);
    if (USE_INVERSE) {
        drawScale(innerWheelScaleNode, LOG10_SCALE, 140, 1, -1);
    }

    // Make the visualisation interactive
    makeInteractive();
};
