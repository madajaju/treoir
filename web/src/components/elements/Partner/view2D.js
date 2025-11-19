const phaseColor = {
	"Current": "#0000ff",
	"Future": "#00ff00"
}
import { tint, shade } from "./pinUtils";

export function create2D(graphContainer, partner, selectNodeCallback = null) {

	// Find all of the layers to the partner
	// Find the layers in the current graph container.
	// Place a circle in the rectangle of the layer.
	function processPartner(partner) {
		for(let sname in partner.elements) {
			mapElement(partner, partner.elements[sname]);
		}
	}

	function mapElement(partner, element) {
			for (let j in element.layers) {
				const layerID = element.layers[j];
				let trimmedLayerID = layerID;
				let groupElement = null;

				// Keep trimming `layerID` until a groupElement is found or no more layers are left.
				while (!groupElement && trimmedLayerID.includes("-")) {
				    groupElement = graphContainer.querySelector(`g[data-layer-id="${trimmedLayerID}"]`);
				    
				    // If not found, remove the last segment after the last '-'
				    if (!groupElement) {
				        trimmedLayerID = trimmedLayerID.substring(0, trimmedLayerID.lastIndexOf("-"));
				    }
				}

				// Final attempt with fully trimmed `layerID`
				if (!groupElement) {
				    groupElement = graphContainer.querySelector(`g[data-layer-id="${trimmedLayerID}"]`);
				}

				// If a groupElement is found, add the interactive circle
				if (groupElement) {
				    addInteractiveCircle(
				        graphContainer,
				        groupElement,
				        { ...element, layer: trimmedLayerID, partner: partner },
				        selectElement,
				        selectNodeCallback,
				        { fill: partner.color || "#ff00ff" }
				    );
				}
				element.partner = partner;
			}
	}
	processPartner(partner);
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
	if(selectNode) {
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
	if(checkNodeID) {
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
    let fill = ensurePinGradient(container, `grad-${node.id.replace(/\s/g,'')}`, circleOptions.fill || "#ff00ff");
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
    const mid  = `${cx},${cy + radius + 2}`;
    const right= `${cx + b},${cy + radius - 2}`;
    const tip  = `${cx},${cy + radius + tipH}`;
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