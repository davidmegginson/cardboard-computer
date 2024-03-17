const SVG_NS = "http://www.w3.org/2000/svg";
const PRECISION = 3;

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

const SQUARE_SCALE = {
    func: (n) => Math.log10(n) / 2,
    ranges: [
        {
            start: 1,
            end: 1.5,
            step: 0.02,
            largeTickInterval: 0.1,
            labelInterval: 1.5
        },
        {
            start: 1.5,
            end: 3,
            step: 0.05,
            largeTickInterval: 0.1,
            labelInterval: 0.5
        },
        {
            start: 3,
            end: 6,
            step: 0.1,
            largeTickInterval: 0.5,
            labelInterval: 1.0
        },
        {
            start: 6,
            end: 10,
            step: 0.2,
            largeTickInterval: 1.0,
            labelInterval: 1.0
        },
        {
            start: 10,
            end: 15,
            step: 0.2,
            largeTickInterval: 1.0,
            labelInterval: 5.0
        },
        {
            start: 15,
            end: 30,
            step: 0.5,
            largeTickInterval: 1.0,
            labelInterval: 5.0
        },
        {
            start: 30,
            end: 60,
            step: 1.0,
            largeTickInterval: 5.0,
            labelInterval: 10.0
        },
        {
            start: 60,
            end: 100,
            step: 2.0,
            largeTickInterval: 10.0,
            labelInterval: 10.0
        }
    ]
}

const CUBE_SCALE = {
    func: (n) => Math.log10(n) / 3,
    ranges: [
        {
            start: 1,
            end: 1.5,
            step: 0.05,
            largeTickInterval: 0.1,
            labelInterval: 0.5
        },
        {
            start: 1.5,
            end: 3,
            step: 0.1,
            largeTickInterval: 0.5,
            labelInterval: 1.0
        },
        {
            start: 3,
            end: 6,
            step: 0.2,
            largeTickInterval: 1.0,
            labelInterval: 1.0
        },
        {
            start: 6,
            end: 10,
            step: 0.5,
            largeTickInterval: 1.0,
            labelInterval: 1.0
        },
        {
            start: 10,
            end: 15,
            step: 0.5,
            largeTickInterval: 1.0,
            labelInterval: 5.0
        },
        {
            start: 15,
            end: 30,
            step: 1.0,
            largeTickInterval: 1.0,
            labelInterval: 5.0
        },
        {
            start: 30,
            end: 60,
            step: 2.0,
            largeTickInterval: 10.0,
            labelInterval: 10.0
        },
        {
            start: 60,
            end: 150,
            step: 5.0,
            largeTickInterval: 10.0,
            labelInterval: 50.0
        },
        {
            start: 150,
            end: 200,
            step: 10.0,
            largeTickInterval: 50.0,
            labelInterval: 50.0
        },
        {
            start: 200,
            end: 300,
            step: 10.0,
            largeTickInterval: 50.0,
            labelInterval: 100.0
        },
        {
            start: 300,
            end: 600,
            step: 20.0,
            largeTickInterval: 100.0,
            labelInterval: 100.0
        },
        {
            start: 600,
            end: 1000,
            step: 50.0,
            largeTickInterval: 100.0,
            labelInterval: 1000.0
        }
    ]
};

function drawScale (node, scaleLabel, scale, yOffset, yDirection, rDirection, labelClass) {
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
    if (!labelClass) {
        labelClass = "label";
    }

    // Label the scale
    if (scaleLabel) {
        node.appendChild(makeElement("text", {
            x: 500,
            y: yOffset + (yDirection == 1 ? 50 : -35),
            class: labelClass,
            fill: "blue",
            transform: "rotate(" + (5.0 * rDirection) + ", 500, 500)"
        }, scaleLabel));
    }
    
    scale.ranges.forEach((range) => {
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
            if (checkInterval(i, range.labelInterval) || i == range.start) {
                node.appendChild(makeElement("text", {
                    x: 500,
                    y: yOffset + (yDirection == 1 ? 50 : -35),
                    class: labelClass,
                    fill: "currentColor",
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


function draw (advanced) {
    drawScale(outerWheelScaleNode, "D", LOG10_SCALE, 80, -1, 1);
    drawScale(innerWheelScaleNode, "C", LOG10_SCALE, 80, 1, 1);
    if (advanced) {
        drawScale(innerWheelScaleNode, "CI", LOG10_SCALE, 140, 1, -1, "label-inverse");
        drawScale(innerWheelScaleNode, "A", SQUARE_SCALE, 200, 1, 1, "label-medium");
        drawScale(innerWheelScaleNode, "K", CUBE_SCALE, 260, 1, 1, "label-small");
    }
}

function makeInteractive () {

    function handler (e) {
        if (problem) {
            showSolution(problem);
            problem = null;
        } else {
            problem = setProblem();
            showProblem(problem);
        }
    }

    // Add the handler for clicks/taps and keypresses
    window.addEventListener("click", handler);
    window.addEventListener("keypress", handler);

    // Call the handler once manually to start the process
    handler();
}


