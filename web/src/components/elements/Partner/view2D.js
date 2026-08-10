const phaseColor = {
    "Current": "#0000ff",
    "Future": "#00ff00"
}
import {shade, tint, getFontColor} from './pinUtils.js';

export function create2D(graphContainer, partner, selectNodeCallback = null) {

    const circles = document.querySelectorAll(
        `.partner-color-circle[data-partner-id="${partner.id}"]`
    );

    // Attach a handler that closes over graphContainer & partner
    circles.forEach(circle => {
        circle.style.cursor = 'pointer';

        // Ensure we don't attach duplicates
        circle.removeEventListener('click', circle._partnerClickHandler);

        const handler = createPartnerCircleClickHandler(graphContainer, partner, selectNodeCallback);
        circle.addEventListener('click', handler);

        // store reference on DOM node so we can remove it next time
        circle._partnerClickHandler = handler;

        // optional: initial state
        if (!circle.dataset.active) {
            circle.dataset.active = 'true'; // or 'false' if you want them initially off
        }
    });

    // Initial overlay draw (if you want them visible by default)
    applyOverlay(graphContainer, partner, selectNodeCallback);
}

// factory that returns a handler with graphContainer & partner closed over
function createPartnerCircleClickHandler(graphContainer, partner, selectNodeCallback) {
    return function onPartnerColorCircleClick(event) {
        event.stopPropagation();

        const circle = event.currentTarget;
        const partnerId = partner.id;
        if (!partnerId) return;

        const wasActive = circle.dataset.active === 'true';
        const nowActive = !wasActive;
        circle.dataset.active = nowActive.toString();

        const svgEl = graphContainer;
        if (!svgEl) return;

        // Use a distinct class for pins (e.g. .gear-pin)
        const pins = svgEl.querySelectorAll(`.gear-pin[partner-id="${partnerId}"]`);

        if (nowActive) {
            // TURN ON
            if (pins.length === 0) {
                applyOverlay(graphContainer, partner, selectNodeCallback);
            } else {
                pins.forEach(pin => { pin.style.display = ''; });
            }
            circle.classList.add('is-active');
        } else {
            // TURN OFF
            pins.forEach(pin => { pin.style.display = 'none'; });
            circle.classList.remove('is-active');
        }
    };
}

function selectElement(container, circle, node, selectNode = null) {

    const circles = container.querySelectorAll("circle");

    // Loop through each circle
    circles.forEach((circle) => {
        // Get the original fill color from the custom attribute
        const originalFill = circle.getAttribute("fill-original");

        // If the attribute exists, restore the fill color
        if (originalFill) {
            circle.setAttribute("fill", originalFill);
        }
    });
    circle.setAttribute("fill", "url(#pinGradient)");
    if (selectNode) {
        selectNode(node);
    }
}

function ensurePinGradient(svgEl, gradId, baseColor) {
    let defs = svgEl.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgEl.prepend(defs);
    }
    let grad = svgEl.querySelector('#' + CSS.escape(gradId));
    if (grad) return 'url(#' + gradId + ')';

    const center = tint(baseColor, 0.65); // much lighter center for contrast
    const mid = tint(baseColor, 0.20); // near the original
    const edge = shade(baseColor, 0.40); // darker rim

    grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('cx', '35%');
    grad.setAttribute('cy', '30%');
    grad.setAttribute('r', '80%');

    const s0 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s0.setAttribute('offset', '0%');
    s0.setAttribute('stop-color', center);

    const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s1.setAttribute('offset', '60%');
    s1.setAttribute('stop-color', mid);

    const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', edge);

    grad.appendChild(s0);
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    return 'url(#' + gradId + ')';
}

function addInteractiveCircle(container, groupElement, node, selectEngagement, selectNodeCallback, circleOptions = {}) {
    // First check that the node-id is not already present.
    const checkNodeID = groupElement.querySelector(`circle[node-id="${node.id}"]`);
    if (checkNodeID) {
        return;
    }
    const existingCircles = groupElement.querySelectorAll("circle");
    const numCircles = existingCircles.length;

    // Get the circle's radius
    const radius = circleOptions.radius || 20; // Default radius
    const spacing = radius / 2; // Spacing between circles (half of the radius)
    const adjustedDiameter = (2 * radius) + spacing; // Adjusted spacing (diameter + half-radius spacing)
    const margin = radius / 2; // Additional spacing from the top-left edge

    // Calculate grid position
    const cols = Math.floor(groupElement.getBBox().width / adjustedDiameter) || 10; // Max number of circles per row
    const row = Math.floor(numCircles / cols); // Current row number
    const col = numCircles % cols; // Current column number

    // Calculate the circle's position with spacing and margin included
    const cx = groupElement.getBBox().x + col * adjustedDiameter + radius + margin; // X position with margin
    const cy = groupElement.getBBox().y + row * adjustedDiameter + radius + margin; // Y position with margin

    // Create the circle element
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute('class', 'overlay-pin');
    g.setAttribute("filter", "url(#pinFlowShadow)");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    let fill = ensurePinGradient(container, `grad-${node.id.replace(/\s/g, '')}`, circleOptions.fill || "#ff00ff");
    circle.setAttribute("node-id", node.id);
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fill);
    circle.setAttribute("fill-original", circleOptions.fill || "url(#pinGradient)");
    circle.setAttribute("class", circleOptions.class || "interactive-circle");

    // Add a <title> element for hover-over tooltip
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = node.name; // Tooltip content
    circle.appendChild(title);
    g.appendChild(circle);

    // pointer triangle
    const b = 5;
    const tipH = 8;
    const left = `${cx - b},${cy + radius - 2}`;
    const mid = `${cx},${cy + radius + 2}`;
    const right = `${cx + b},${cy + radius - 2}`;
    const tip = `${cx},${cy + radius + tipH}`;
    const stroke = shade(fill, 0.5);
    const path = document.createElementNS(circle.namespaceURI, 'path');
    path.setAttribute('d', `M ${left} L ${mid} L ${right} L ${tip} Z`);
    path.setAttribute('fill', shade(fill, 0.45));
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '1');
    g.appendChild(path);

    // Add a click event to call the selectedEngagement function
    circle.addEventListener("click", (event) => {
        // Call the selectedEngagement function if provided
        if (typeof selectEngagement === "function") {
            selectEngagement(container, circle, node, selectNodeCallback);
        } else {
            console.error("selectedEngagement function not provided.");
        }
        event.stopPropagation(); // Example: Stop event propagation if necessary
    });

    // Append the circle to the group
    groupElement.appendChild(circle);
}

// build the map path → { phaseName→{count,engagements[]} }
export function buildOverlayIndex(partner) {
    const root = {count: 0, _children: {}};

    if (!partner?.elements) return root;

    for (const element of Object.values(partner.elements)) {
        if (!element.layers) continue;

        for (const layerPathRaw of element.layers) {
            const parts = layerPathRaw
                .split('-')
                .map(p => p.trim())
                .filter(Boolean);

            if (parts.length === 0) continue;

            // Insert into tree
            let currentLevel = root;
            for (const part of parts) {
                if (!currentLevel._children.hasOwnProperty(part)) {
                    if (currentLevel.name) {
                        currentLevel._children[part] = {
                            _parent: currentLevel,
                            count: 0,
                            "name": currentLevel.name + '-' + part,
                            elements: [],
                            _children: {}
                        };
                    } else {
                        currentLevel._children[part] = {
                            _parent: currentLevel,
                            count: 0,
                            "name": part,
                            elements: [],
                            _children: {}
                        };
                    }
                }
                currentLevel._children[part].count++;
                currentLevel._children[part].elements.push(element);
                currentLevel = currentLevel._children[part];
            }
        }
    }

    function extractLeafNodes(node, result = []) {
        if (Object.keys(node._children).length === 0) {
            result.push(node);
        } else {
            for (const child of Object.values(node._children)) {
                extractLeafNodes(child, result);
            }
        }
        return result;
    }

    const leafNodes = extractLeafNodes(root);
    return leafNodes;
}

// draw one pin
export function drawPin(svgEl, parentG, name, color, cx, cy, count = 1) {
    const r = 15, tipH = 8, stroke = shade(color, 0.5),
        fill = ensurePinGradient(svgEl, `grad-${parentG.id}`, color);
    const g = document.createElementNS(svgEl.namespaceURI, 'g');
    g.setAttribute('class', 'overlay-pin');
    g.setAttribute('filter', 'url(#pinGlowShadow)');

    // circle
    const c = document.createElementNS(svgEl.namespaceURI, 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    c.setAttribute('stroke', stroke);
    c.setAttribute('stroke-width', '1.5');
    g.appendChild(c);
    // pointer
    const p = document.createElementNS(svgEl.namespaceURI, 'path');
    const b = 5;
    const left = `${cx - b},${cy + r - 2}`, mid = `${cx},${cy + r + 2}`, right = `${cx + b},${cy + r - 2}`,
        tip = `${cx},${cy + r + tipH}`;
    p.setAttribute('d', `M ${left} L ${mid} L ${right} L ${tip} Z`);
    p.setAttribute('fill', shade(color, 0.45));
    p.setAttribute('stroke', stroke);
    p.setAttribute('stroke-width', '1');
    g.appendChild(p);
    // count text
    if (count > 1) {
        const t = document.createElementNS(svgEl.namespaceURI, 'text');
        t.setAttribute('x', cx);
        t.setAttribute('y', cy + 5);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '14');
        t.setAttribute('font-weight', '700');
        t.setAttribute('fill', "#000");
        t.textContent = count;
        g.appendChild(t);
    }
    parentG.appendChild(g);
    g.style.cursor = 'pointer';
    g.addEventListener('click', ev => {
        ev.stopPropagation();
        // 1) clear prior selection
        svgEl.querySelectorAll('.overlay-pin.selected')
            .forEach(el => el.classList.remove('selected'));

        // 2) mark this pin
        g.classList.add('selected');

        // 3) read & show its <title> text
        const tip = g.querySelector('title')?.textContent || '';
        const desc = document.getElementById('description-panel');
        if (desc) desc.textContent = tip;
    });
    return g;
}

export function renderPin(graph2DDiv, cell, item, partner, callback) {
    if (!cell) return;

    const box = cell.querySelector('.gear-layer-title');
    if (!box) return;


    let pinContainer = box.querySelector('.pin-container');
    if (!pinContainer) {
        pinContainer = document.createElement('div');
        pinContainer.className = 'pin-container';
        Object.assign(pinContainer.style, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '4px 8px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            flexGrow: '1',
        });
        box.appendChild(pinContainer);
    }

    // Create new pin element
    const pinId = `pin-${item.name.replace(/\s+/g, '-')}-${partner.name.replace(/\s+/g, '-')}`;
    if(graph2DDiv.querySelector(`#${pinId}`)) {
        return;
    }

        const pin = document.createElement('div');
        pin.setAttribute('partner-id', partner.id);
        pin.className = 'gear-pin'; // <-- not 'pin-container'
        pin.textContent = item.count;
        pin.id = pinId;
        Object.assign(pin.style, {
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: partner.color || '#bb7700',
            color: '#fff',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            flexShrink: '0',
        });

    // Tooltip for names
    const lines = item.elements.map(el => el.name).filter(Boolean);
    pin.title = lines.join('\n');

    pin.addEventListener('click', event => {
        event.stopPropagation(); // prevent bubbling if needed
        if (typeof callback === 'function') {
            callback(item);
        }
    });

    pinContainer.appendChild(pin);
}

// position all pins on one layer-group
export function addPinsForNode(svgEl, group, item, partner) {
    const rect = group.querySelector('rect');
    if (!rect) return;
    group.querySelectorAll('.overlay-pin').forEach(n => n.remove());
    const x = +rect.getAttribute('x'), y = +rect.getAttribute('y'), w = +rect.getAttribute('width');
    const margin = 6, pinW = 30, gap = 6, rowH = 24;
    const xLeft = x + margin, xRight = x + w - margin;
    let row = 0, xCur = xLeft;
    if (xCur + pinW > xRight) {
        row++;
        xCur = xLeft;
    }
    const cx = xCur + pinW / 2, cy = y + 14 + row * rowH;
    const color = partner.color || "#0000ff";
    const pin = drawPin(svgEl, group, item.name, color, cx, cy, item._count);
    // tooltip
    const title = document.createElementNS(svgEl.namespaceURI, 'title');
    const lines = [];
    for (let i in item.elements) {
        lines.push(`${item.elements[i].name}`);
    }
    title.textContent = lines.join('\n');
    pin.prepend(title);
}

// main entrypoint: call after you render your SVG into the DOM
export function applyOverlay(svgEl, partner, callback) {
    if (!partner) return;
    const raw = buildOverlayIndex(partner);
    if (!raw.length) return;
    svgEl.querySelectorAll('.overlay-pin').forEach(n => n.remove());
    let pins = {};
    for (let i in raw) {
        let item = raw[i];
        let g = svgEl.querySelector(`.gear-layer-cell[data-layer-id="${item.name}"]`);
        while (!g && item._parent) {
            item = item._parent;
            g = svgEl.querySelector(`.gear-layer-cell[data-layer-id="${item.name}"]`);
        }
        if (g) {
            if (!pins.hasOwnProperty(item.name)) {
                pins[item.name] = {g: g, item: item, partner: partner, count: item.count};
            } else {
                pins[item.name].count += item.count;
            }
        }
    }
    for (let i in pins) {
        let pin = pins[i];
        renderPin(svgEl, pin.g, pin.item, pin.partner, callback);
    }
}


// clear all pins & legend
export function clearPins(svgEl) {
    svgEl.querySelectorAll('.gear-pin').forEach(n => n.remove());
}

export function setCustomerData(data) {
    customerData = data;
}

export function getCustomerData() {
    return customerData;
}

function onPartnerColorCircleClick(event) {
    event.stopPropagation();

    const circle = event.currentTarget; // since we attach directly
    const partnerId = circle.getAttribute('data-partner-id');
    if (!partnerId) return;

    const isActive = circle.dataset.active === 'true';
    const nowActive = !isActive;
    circle.dataset.active = nowActive.toString();

    const svgEl = document.querySelector('#graph2DDiv'); // replace with correct selector
    if (!svgEl) return;

    // Find this partner's pins (class name changed to gear-pin)
    const pins = svgEl.querySelectorAll(`.gear-pin[partner-id="${partnerId}"]`);

    if (nowActive) {
        // TURN ON
        // If no pins yet, (re)draw overlay for this partner:
        if (pins.length === 0) {
            applyOverlay(graphContainer, partner, selectNodeCallback);
        } else {
            pins.forEach(pin => { pin.style.display = ''; });
        }
        circle.classList.add('is-active');
    } else {
        // TURN OFF
        pins.forEach(pin => { pin.style.display = 'none'; });
        circle.classList.remove('is-active');
    }
}