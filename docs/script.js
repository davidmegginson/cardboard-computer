//
// Constants
//

const SVG_NS = "http://www.w3.org/2000/svg";
const PRECISION = 3;

/**
 * Draw a scale on the circular sliderule
 */
function drawScale (node, scaleLabel, scale, yOffset, yDirection, labelClass) {

    function checkInterval (i, interval) {
        let x = Math.round(i * 1000);
        let y = Math.round(interval * 1000);
        return (x % y == 0);
    }

    function makeRotation (deg) {
        return "rotate(" + (Math.log10(deg) / scale.factor) * 360.0 + ", 500, 500)";
    }

    let scaleNode = makeElement("g", {
        class: "scale"
    });
    
    if (!yDirection) {
        yDirection = 1;
    }

    if (!labelClass) {
        labelClass = "label";
    }

    // Label the scale
    if (scaleLabel) {
        scaleNode.appendChild(makeElement("text", {
            x: 500,
            y: yOffset + (yDirection == 1 ? 50 : -35),
            class: labelClass,
            fill: "blue",
            transform: "rotate(" + (scale.factor < 0 ? -5 : 5) + ", 500, 500)"
        }, scaleLabel));
    }
    
    scale.ranges.forEach((range) => {
        for (let i = range.start; i < range.end; i += range.step) {
            let isLarge = checkInterval(i, range.largeTickInterval);
            let rotation = makeRotation(i);
            scaleNode.appendChild(makeElement("line", {
                x1: 500,
                x2: 500,
                y1: yOffset,
                y2: yOffset + (isLarge ? 30: 20) * yDirection,
                stroke: "black",
                stroke_width: (isLarge ? 2 : 1),
                transform: rotation
            }));
            if (checkInterval(i, range.labelInterval) || i == range.start) {
                scaleNode.appendChild(makeElement("text", {
                    x: 500,
                    y: yOffset + (yDirection == 1 ? 50 : -35),
                    class: labelClass,
                    fill: "currentColor",
                    transform: rotation
                }, i.toLocaleString()));
            }
        }
    });

    if (scale.specialValues) {
        scale.specialValues.forEach((special) => {
            let rotation = makeRotation(special.value);
            scaleNode.appendChild(makeElement("text", {
                x: 500,
                y: yOffset + (yDirection == 1 ? 50 : -35),
                class: labelClass,
                fill: "grey",
                transform: rotation
            }, special.label));
            scaleNode.appendChild(makeElement("line", {
                x1: 500,
                x2: 500,
                y1: yOffset,
                y2: yOffset + 30 * yDirection,
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
 * Rotate a node around its centre.
 * The degrees of rotation will be the log10 of n
 * 1 (default) means clockwise; -1 means counter-clockwise.
 */
function rotate (rotations) {

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


/**
 * Generate a multiplication or division problem
 */
function setProblem () {

    const PI_CUTOFF = 9.0;

    let problem = {};

    // TODO problems with pi
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

    problem.n3 = Number(result.toPrecision(PRECISION));
    problem.eq = (result == problem.n3) ? "=" : "=~";

    return problem;
}


/**
 * Show a problem without the solution
 */
function showProblem (problem) {
    document.getElementById("n1").textContent = problem.n1 == Math.PI ? "π" : problem.n1.toLocaleString();
    document.getElementById("op").textContent = problem.op;
    document.getElementById("n2").textContent = problem.n2 == Math.PI ? "π" : problem.n2.toLocaleString();
    document.getElementById("eq").textContent = problem.eq;
    document.getElementById("n3").textContent = "?";
    rotate([
        [slideRuleNode, 1, 0, 0],
        [outerWheelNode, 1, 0, 0],
        [innerWheelNode, 1, 0, 0],
        [cursorNode, 1, 0, 0]
    ]);
}

/**
 * Show the solution, including transforming the wheel and cursor.
 */
function showSolution (problem) {
    document.getElementById("n3").textContent = problem.n3.toLocaleString();
    if (problem.op == '×') {
        rotate([
            [outerWheelNode, problem.n1, -1, 2, 0],
            [slideRuleNode, problem.n2, -1, 2, 2],
            [cursorNode, problem.n2, 1, 2, 4]
        ]);
    } else {
        rotate([
            [outerWheelNode, problem.n1, -1, 2, 0],
            [innerWheelNode, problem.n2, -1, 2, 2],
            [slideRuleNode, problem.n2, 1, 2, 4],
            [cursorNode, problem.n2, -1, 2, 6]
        ]);
    }
}


// Set up variables

let slideRuleNode = document.getElementById("sliderule-diagram");
let outerWheelNode = document.getElementById("outer-wheel");
let innerWheelNode = document.getElementById("inner-wheel");
let cursorNode = document.getElementById("cursor");

let problem = null;


function draw (advanced) {
    fetch("data/scales.json").then((response) => response.json()).then((scales) => {
        drawScale(outerWheelNode, "D", scales.LOG10, 80, -1);
        drawScale(innerWheelNode, "C", scales.LOG10, 80, 1);
        if (advanced) {
            drawScale(innerWheelNode, "CI", scales.INVERSE_LOG10, 140, 1, "label-inverse");
            drawScale(innerWheelNode, "A", scales.SQUARE, 200, 1, "label-medium");
            drawScale(innerWheelNode, "K", scales.CUBE, 260, 1, "label-small");
        }
    });
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


