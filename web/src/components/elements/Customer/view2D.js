const phaseColor = {
	"Current": "#0000ff",
	"Future": "#00ff00"
}
export function create2D(graphContainer, customer, selectNodeCallback = null) {

	// Find all of the layers to the customer
	// Find the layers in the current graph container.
	// Place a circle in the rectangle of the layer.
	function processCustomer(customer) {
		for (let cname in customer.phases) {
			processState(customer, customer.phases[cname]);
		}
	}

	function processState(customer, phase) {
		let id = customer.name + '-' + phase.name;
		for(let sname in phase.suppliers) {
			processSupplier(customer, phase, phase.suppliers[sname]);
		}
	}
	function processSupplier(customer, phase, supplier) {
		for(let sname in supplier.engagements) {
			mapEngagement(customer, phase, supplier, supplier.engagements[sname]);
		}
	}

	function mapEngagement(customer,phase,supplier,engagement) {
			for (let j in engagement.layers) {
				const layerID = engagement.layers[j];
				const groupElement = graphContainer.querySelector(`g[data-layer-id="${layerID}"]`);
				engagement.phase = phase;
				engagement.customer = customer;
				engagement.supplier = supplier;

				if(groupElement) {
					addInteractiveCircle(graphContainer,
						groupElement,
						{...engagement, layer: layerID, phase:phase, customer:customer, supplier: supplier},
						selectEngagement,
						selectNodeCallback,
						{fill: phaseColor[phase.name]}
					);
				}
			}
	}
	processCustomer(customer);
}

function selectEngagement(container, circle, node, selectNode = null) {

	const circles = container.querySelectorAll("circle");

	// Loop through each circle
	circles.forEach((circle) => {
		// Get the original fill color from the custom attribute
		const originalFill = circle.getAttribute("fill-orginal");

		// If the attribute exists, restore the fill color
		if (originalFill) {
			circle.setAttribute("fill", originalFill);
		}
	});
	circle.setAttribute("fill", "yellow");
	if(selectNode) {
		selectNode(node);
	}
}

function addInteractiveCircle(container, groupElement, node, selectEngagement, selectNodeCallback, circleOptions = {}) {
	// Count existing circles in the group (same as before)


	const existingCircles = groupElement.querySelectorAll("circle");
	const numCircles = existingCircles.length;

	// Get the group's bounding box
	const bbox = groupElement.getBBox();
	const groupWidth = bbox.width || 500; // Default width
	const groupHeight = bbox.height || 500; // Default height

	// Calculate the new circle's position
	const numRows = Math.round(Math.sqrt(numCircles + 1)); // Row count
	const numCols = Math.ceil((numCircles + 1) / numRows); // Column count
	const row = Math.floor(numCircles / numCols);
	const col = numCircles % numCols;
	const cellWidth = groupWidth / numCols;
	const cellHeight = groupHeight / numRows;

	const cx = bbox.x + col * cellWidth + cellWidth / 2; // Center X
	const cy = bbox.y + row * cellHeight + cellHeight / 2; // Center Y

	// Create the circle element
	const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("cx", cx);
	circle.setAttribute("cy", cy);
	circle.setAttribute("r", circleOptions.radius || 20);
	circle.setAttribute("fill", circleOptions.fill || "yellow");
	circle.setAttribute("fill-orginal", circleOptions.fill || "yellow");
	circle.setAttribute("class", circleOptions.class || "interactive-circle");

	// Add a <title> element for hover-over tooltip
	const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
	title.textContent = node.name; // Tooltip content
	circle.appendChild(title);

	// Add a click event to call the selectedEngagement function
	circle.addEventListener("click", (event) => {
		// Call the selectedEngagement function where required
		if (typeof selectEngagement === "function") {
			selectEngagement(container, circle, node, selectNodeCallback);
		} else {
			console.error("selectedEngagement function not provided.");
		}

		// Example: Stop event propagation if necessary
		event.stopPropagation();
	});

	// Append the circle to the group
	groupElement.appendChild(circle);
}