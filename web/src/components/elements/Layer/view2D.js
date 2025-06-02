import {getLayer} from '../../../stores/layerStore.js';
import {currentCustomer} from '../../../stores/customerStore.js';
import {currentPartner} from '../../../stores/partnerStore.js';
import {Customer} from '../Customer/index.js';
import {Partner} from '../Partner/index.js';

export function create2D(graph2DDiv, element, selectNodeCallback = null, level = 2) {
    // Utility function to break text into multiple lines
    function wrapText(text, maxWidth, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        const svgContextFactor = 0.6; // Approximation: Font size to character width ratio

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = `${currentLine} ${word}`;
            const testWidth = testLine.length * fontSize * svgContextFactor;

            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        // If the currentCustomer is selected then draw it too.

        return lines;
    }

    // Function to generate the SVG
    function generateSVG(layer, width = 3000, height = 1500, depth = 2) {
        // Start the SVG container
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="font-family: Arial, sans-serif;">`;
        svgContent += `<rect width="100%" height="100%" fill="white"/>`; // Background
        let totalHeight = height;
        const boxPadding = 10; // Padding between grid cells and edge inside rectangles

        // Recursive function to draw a layer and its children using grid layout
        const drawLayer = (parentLayer, x, y, availableWidth, availableHeight, depth, currentDepth = 0, peerFontSize = null) => {
            const baseFontSize = totalHeight/20;

            // Determine the rectangle color based on depth
            // Extract base color from parent layer's color if it exists
            let baseColor = '#CCCCCC'; // Default base color
            if (parentLayer.color && parentLayer.color.startsWith('#')) {
                baseColor = parentLayer.color;
            }
            const color = parentLayer.color;
            // Calculate label height based on number of sublayers
            const childLayers = parentLayer._children || {};
            const numChildren = Object.keys(childLayers).length;
            let labelHeight;
            if (numChildren === 0) {
                labelHeight = Math.min(availableHeight / 3); // No sublayers - use 1/3
            } else if (numChildren <= 5) {
                labelHeight = Math.min(availableHeight / 20, 20); // Few sublayers - use 1/5
            } else {
                labelHeight = Math.min(availableHeight / 10, 20); // Many sublayers - use 1/10
            }
            labelHeight = Math.max(labelHeight, baseFontSize);
            // Ensure labelHeight doesn't exceed available height
            labelHeight = Math.min(labelHeight, availableHeight);
            let fontSize = labelHeight - 8; // Dynamic font size for labels
            
            // How do I check if the labelHeight is larger than the rectangle

            // Draw the parent rectangle
            let svgString = `<g class="layer-group" data-layer-name="${parentLayer.name}" data-layer-id="${parentLayer.id}"><title>${parentLayer.name}</title>`;
            svgString += `<rect x="${x}" y="${y}" width="${availableWidth}" height="${availableHeight}" fill-original="${color}" fill="${color}" stroke="#333" stroke-width="2" rx="10" ry="10"/>`;

            // Wrap and render the label inside the rectangle at the top
            let lines = wrapText(parentLayer.name, availableWidth - 2 * boxPadding, fontSize);
            while (lines.length * fontSize * 1.2 > labelHeight && fontSize > 8) {
                // Adjust font size if needed
                fontSize -= 1;
                lines = wrapText(parentLayer.name, availableWidth - 2 * boxPadding, fontSize);
            }

            let currentLabelY = y + fontSize + 5; // First line of text inside rectangle
            let fontColor = _getFontColor(color);
            lines.forEach((line) => {
                svgString += `<text x="${x + availableWidth / 2}" y="${currentLabelY}" fill="${fontColor}" font-size="${fontSize}" text-anchor="middle">${line}</text>`;
                currentLabelY += fontSize * 1.2; // Spacing between lines
            });

            // Render child layers inside the parent rectangle using grid layout
            if (currentDepth < depth) {
                const childLayers = parentLayer._children || {};
                if (childLayers.length > 0) {
                    // Determine the maximum rows and columns for the children
                    let maxRow = 1,
                        maxCol = 1;
                    for (const i in childLayers) {
                        let layer = childLayers[i];
                        const position = layer.position || {};
                        maxRow = Math.max(maxRow, (position.row || 1) + ((position.rowspan || 1) - 1));
                        maxCol = Math.max(maxCol, (position.col || 1) + ((position.colspan || 1) - 1));
                    }

                    const cellWidth = (availableWidth - boxPadding * (maxCol + 1)) / maxCol;
                    const cellHeight = (availableHeight - labelHeight - boxPadding * (maxRow + 1)) / maxRow;

                    const depthFactor = 20; // Color darkening factor for each depth
                    const baseColorNum = parseInt(baseColor.slice(1), 16);
                    let r = (baseColorNum >> 16) & 255;
                    let g = (baseColorNum >> 8) & 255;
                    let b = baseColorNum & 255;
                    r = Math.max(0, Math.min(255, r + depthFactor));
                    g = Math.max(0, Math.min(255, g + depthFactor));
                    b = Math.max(0, Math.min(255, b + depthFactor));
                    const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

                    // Draw each child layer based on its grid position
                    for (let i in childLayers) {
                        // Check depth level (assumes parentLayer tracks depth)
                        let childLayer = childLayers[i];
                        let name = childLayer.name;
                        childLayer.color = childLayer.color || newColor;
                        const pos = childLayer.position || {row: 1, col: 1, rowspan: 1, colspan: 1};
                        const childX = x + boxPadding + (pos.col - 1) * (cellWidth + boxPadding);
                        const childY = y + labelHeight + boxPadding + (pos.row - 1) * (cellHeight + boxPadding);
                        const childWidth = cellWidth * (pos.colspan || 1) + boxPadding * ((pos.colspan || 1) - 1);
                        const childHeight =
                            cellHeight * (pos.rowspan || 1) + boxPadding * ((pos.rowspan || 1) - 1);
                        childLayer.name = childLayer.name || name;

                        childLayer.depth = (parentLayer.depth || 0) + 1;
                        // Recursive call to render child layers
                        svgString += drawLayer(childLayer, childX, childY, childWidth, childHeight, depth, currentDepth + 1);
                    }
                }
            }
            svgString += '</g>';
            return svgString;
        };

        // Render the top-level layer rectangle
        svgContent += drawLayer(layer, 50, 50, width - 100, height - 100, depth); // Add some outer margins for the top-level rectangle
        svgContent += `</svg>`;
        return svgContent;
    }

    function drawcustomer(div) {
        currentCustomer.subscribe((customer) => {
            if(customer) {
                Customer.get2DView(div, customer, selectNodeCallback);
            }
        });
    }
    function drawpartner(div) {
        currentPartner.subscribe((partner) => {
            if(partner) {
                Partner.get2DView(div, partner, selectNodeCallback);
            }
        });
    }

    // Generate each top-level layer's SVG
    const data = generateSVG(element,3000, 1500, level);
    if (graph2DDiv) {
        graph2DDiv.innerHTML = data;
        graph2DDiv.querySelectorAll('.layer-group').forEach((group) => {
            group.addEventListener('click', (event) => {
                event.stopPropagation();
                const rect = group.querySelector('rect'); // Get the rect inside the <g>
                const layerId = group?.getAttribute('data-layer-name');
                const text = group?.querySelector('text');
                if (layerId) {
                    selectLayer(graph2DDiv, layerId, rect,text, selectNodeCallback);
                }
            });
        });
        drawcustomer(graph2DDiv);
        drawpartner(graph2DDiv);
    }
}


function selectLayer(container, id, rect, text, selectNodeCallback = null) {
    // Deselect previous layer if any
    const rects = container.querySelectorAll('rect');
    rects.forEach((rect) => {
        const orginalFill = rect.getAttribute('fill-original');
        if (orginalFill) {
            let prevText = rect.nextElementSibling;
            if(prevText && prevText.tagName === 'text') {
                const fontColor = _getFontColor(orginalFill);
                prevText.setAttribute('fill', fontColor);
            }
            rect.setAttribute('fill', orginalFill);
        }
    });
    rect.setAttribute('fill', '#ffff00');
    text.setAttribute('fill', '#000000');
    if (selectNodeCallback) {
        const layer = getLayer(id);
        if (selectNodeCallback) {
            selectNodeCallback(layer);
        }
    }
}

function _getFontColor(hexColor) {
    hexColor = hexColor.replace('#', '');
    // Parse the RGB values
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    // Calculate brightness (using luminance formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if(brightness > 50) {
        return "#ffffff";
    }
    return "#000000";
}
