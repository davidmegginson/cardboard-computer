window.onload = () => {

    // Construct an element node with the name, attributes, and text content provided
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

    // Generate a multiplication or division problem
    function setProblem () {

        let factor1 = Math.floor(Math.random() * 10.0);
        let factor2 = Math.floor(Math.random() * 10.0);

        if (factor1 > 2) {
            factor1 = 2;
        }

        if (factor2 > 2) {
            factor2 = 2;
        }

        let n1 = Math.ceil(Math.random() * (10.0 ** factor1));
        let n2 = Math.ceil(Math.random() * (10.0 ** factor2));
        let n3 = null;
        let op = null;
        let eq = null;

        n1 == 1 && n1++;
        n2 == 1 && n2++;

        if (Math.random() >= 0.5) {
            op = "×";
            eq = "=";
            n3 = n1 * n2;
            rotateWheel(n1);
            rotateCursor(n2);
        } else {
            op = "÷";
            if (n1 < n2) {
                [n1, n2] = [n2, n1];
            }
            n3 = Math.round((n1 / n2) * 10.0) / 10.0;
            if (n3 == n1 / n2) {
                eq = "=";
            } else {
                eq = "=~";
            }
            rotateWheel(n3);
            rotateCursor(n2);
        }

        return [n1, op, n2, eq, n3];
    }

    function rotateWheel (n) {
        outer_wheel_node.setAttribute("transform", "rotate(" + Math.log10(n) * -360.0 + ", 500, 500)");
    }

    function rotateCursor (n) {
        cursor_node.setAttribute("transform", "rotate(" + Math.log10(n) * 360.0 + ", 500, 500)");
    }

    let outer_wheel_node = document.getElementById("outer-wheel");
    let inner_wheel_node = document.getElementById("inner-wheel");
    let cursor_node = document.getElementById("cursor");
    
    for (let i = 2; i < 1000; i++) {

        // figure out where to place the tick, on a circular log10 scale
        let rotation = Math.log10(i) * 360.0;
        let transform  = "rotate(" + rotation + ", 500, 500)";

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

        outer_wheel_node.appendChild(makeElement("line", {
            x1: 500, x2: 500, y1: (80 - tick_offset), y2: 80, stroke: "black", "stroke-width": tick_stroke, transform: transform
        }));

        inner_wheel_node.appendChild(makeElement("line", {
            x1: 500, x2: 500, y1: 80, y2: 80 + tick_offset, stroke: "black", "stroke-width": tick_stroke, transform: transform
        }));

        // labels
        if (i < 20 || (i < 60 && (i % 5) == 0)) {
            let label_text = "" + (i <= 9 ? i * 10 : i);
            if (i == 10) {
                continue; // already drawing this as a special circle
            }
            outer_wheel_node.appendChild(makeElement("text", {
                x: 500, y: 45, class: "label", transform: transform
            }, label_text));

            inner_wheel_node.appendChild(makeElement("text", {
                x: 500, y: 130, class: "label", transform: transform
            }, label_text));
        }

    }

    
    let [n1, op, n2, eq, n3]  = setProblem();
    document.getElementById("n1").textContent = "" + n1;
    document.getElementById("op").textContent = op;
    document.getElementById("n2").textContent = "" + n2;
    document.getElementById("eq").textContent = eq;
    document.getElementById("n3").textContent = "" + n3;
    
};
