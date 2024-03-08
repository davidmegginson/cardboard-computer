window.onload = () => {

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

    let outer_wheel_node = document.getElementById("outer-wheel");
    let inner_wheel_node = document.getElementById("inner-wheel");

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

    // rotate the outer wheel a bit
    outer_wheel_node.setAttribute("transform", "rotate(" + Math.log10(1.51) * -360.0 + ", 500, 500)");
};
