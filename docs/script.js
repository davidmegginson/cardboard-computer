window.onload = () => {

    /**
     * Construct a DOM element in the SVG namespace
     * Use the local name and (optionally) attributes and text content provided
     */
    function makeElement (name, atts, value) {
        node = document.createElementNS("http://www.w3.org/2000/svg", name);
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
    function makeRotation(n) {
        return "rotate(" + n + ", 500, 500)";
    }

    
    /**
     * Rotate a node around its centre.
     * The degrees of rotation will be the log10 of n
     * 1 (default) means clockwise; -1 means counter-clockwise.
     */
    function rotate (node, n, direction) {
        if (!direction) {
            direction = 1;
        }
        let degrees = Math.log10(n) * 360.0 * direction;
        node.setAttribute("transform", makeRotation(degrees));
    }


    /**
     * Draw the scales on the wheels.
     * TODO: this needs to be modularised
     */
    function drawScales (outerWheelNode, innerWheelNode) {
        for (let i = 2; i < 1000; i++) {

            // figure out where to place the tick, on a circular log10 scale
            let rotation = Math.log10(i) * 360.0;

            // tick defaults (small tick)
            let tick_offset = 20;
            let tick_stroke = 1;

            if (i > 150 && i < 300 && (i % 2) != 0) {
                continue;
            }
            if (i > 300 && (i % 5) != 0) {
                continue;
            }
            if (i > 600 && (i % 10) != 0) {
                continue;
            }

            // larger ticks
            if (i < 10 || (i < 150 && (i % 5) == 0) || (i < 300 && (i % 20) == 0) || (i < 600 && (i % 10) == 0)) {
                tick_offset = 30;
                tick_stroke = 2;
            }

            outerWheelNode.appendChild(makeElement("line", {
                x1: 500, x2: 500, y1: (80 - tick_offset), y2: 80, stroke: "black", "stroke-width": tick_stroke, transform: makeRotation(rotation)
            }));

            innerWheelNode.appendChild(makeElement("line", {
                x1: 500, x2: 500, y1: 80, y2: 80 + tick_offset, stroke: "black", "stroke-width": tick_stroke, transform: makeRotation(rotation)
            }));

            // labels
            if (i < 20 || (i < 60 && (i % 5) == 0)) {
                let label_text = "" + (i <= 9 ? i * 10 : i);
                if (i == 10) {
                    continue; // already drawing this as a special circle
                }
                outerWheelNode.appendChild(makeElement("text", {
                    x: 500, y: 45, class: "label", transform: makeRotation(rotation)
                }, label_text));

                innerWheelNode.appendChild(makeElement("text", {
                    x: 500, y: 130, class: "label", transform: makeRotation(rotation)
                }, label_text));
            }

        }
        
    }

    
    /**
     * Generate a multiplication or division problem
     */
    function setProblem () {

        let problem = {};

        let factor1 = Math.floor(Math.random() * 10.0);
        let factor2 = Math.floor(Math.random() * 10.0);

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
            problem.eq = "=";
            problem.n3 = problem.n1 * problem.n2;
        } else {
            problem.op = "÷";
            if (problem.n1 < problem.n2) {
                [problem.n1, problem.n2] = [problem.n2, problem.n1];
            }
            problem.n3 = Math.round((problem.n1 / problem.n2) * 10.0) / 10.0;
            if (problem.n3 == problem.n1 / problem.n2) {
                problem.eq = "=";
            } else {
                problem.eq = "=~";
            }
        }

        return problem;
    }


    /**
     * Show a problem without the solution
     */
    function showProblem (problem) {
        document.getElementById("n1").textContent = "" + problem.n1;
        document.getElementById("op").textContent = problem.op;
        document.getElementById("n2").textContent = "" + problem.n2;
        document.getElementById("eq").textContent = problem.eq;
        document.getElementById("n3").textContent = "?";
        rotate(outerWheelNode, 1);
        rotate(cursorNode, 1);
    }

    /**
     * Show the solution, including transforming the wheel and cursor.
     */
    function showSolution (problem) {
        console.log(problem);
        document.getElementById("n3").textContent = "" + problem.n3;
        if (op == '×') {
            rotate(outerWheelNode, problem.n1, -1);
            rotate(cursorNode, problem.n2);
        } else {
            rotate(outerWheelNode, problem.n3, -1);
            rotate(cursorNode, problem.n2);
        }
    }


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


    // Set up variables
    let outerWheelNode = document.getElementById("outer-wheel");
    let innerWheelNode = document.getElementById("inner-wheel");
    let cursorNode = document.getElementById("cursor");
    let problem = null;

    // Draw the scales on the wheels
    drawScales(outerWheelNode, innerWheelNode);

    // Add the handler for clicks/taps and keypresses
    window.addEventListener("click", handler);
    window.addEventListener("keypress", handler);

    // Call the handler once manually to start the process
    handler();
};
