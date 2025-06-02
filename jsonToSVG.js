const fs = require("fs");

// Load the input JSON file
const inputFile = "./gear.json"; // Replace with your file name
const rawData = fs.readFileSync(inputFile, "utf8");
const hierarchyData = JSON.parse(rawData);

// Utility function to break text into multiple lines
function wrapText(text, maxWidth, fontSize) {
    if(text === "Digital Architecture") {
       console.error("Error: text is undefined");
    }
    const words = text.split(" ");
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
    return lines;
}


// Function to generate the SVG
function generateSVG(layer, width = 1000, height = 800) {
    // Start the SVG container
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="font-family: Arial, sans-serif;">`;
    svgContent += `<rect width="100%" height="100%" fill="white"/>`; // Background

    const boxPadding = 10; // Padding between grid cells and edge inside rectangles

    // Recursive function to draw a layer and its children using grid layout
    const drawLayer = (parentLayer, x, y, availableWidth, availableHeight) => {

        // Determine the rectangle color based on depth
        const baseColor = 204; // Base color (decimal for #CCCCCC)
        const depthFactor = 20; // Color darkening factor for each depth
        const depthAdjustedColor = Math.max(0, baseColor - (parentLayer.depth || 0) * depthFactor);
        const color = parentLayer.color || `rgb(${depthAdjustedColor}, ${depthAdjustedColor}, ${depthAdjustedColor})`;
        const labelHeight = 30; // Space reserved for text inside the rectangle
        let fontSize = labelHeight - 8; // Dynamic font size for labels

        // Draw the parent rectangle
        let svgString = `<g><title>${parentLayer.name}</title>`;
        svgString += `<rect x="${x}" y="${y}" width="${availableWidth}" height="${availableHeight}" fill="${color}" stroke="#333" stroke-width="2" rx="10" ry="10"/>`;

        // Wrap and render the label inside the rectangle at the top
        let lines = wrapText(parentLayer.name, availableWidth - 2 * boxPadding, fontSize);
        while (lines.length * fontSize * 1.2 > labelHeight && fontSize > 8) {
            // Adjust font size if needed
            fontSize -= 1;
            lines = wrapText(parentLayer.name, availableWidth - 2 * boxPadding, fontSize);
        }

        let currentLabelY = y + fontSize + 5; // First line of text inside rectangle
        lines.forEach((line) => {
            svgString += `<text x="${x + availableWidth / 2}" y="${currentLabelY}" fill="black" font-size="${fontSize}" text-anchor="middle">${line}</text>`;
            currentLabelY += fontSize * 1.2; // Spacing between lines
        });

        // Render child layers inside the parent rectangle using grid layout
        const childLayers = parentLayer.layers || {};
        if (Object.keys(childLayers).length > 0) {
            // Determine the maximum rows and columns for the children
            let maxRow = 1,
                maxCol = 1;
            for (const layer of Object.values(childLayers)) {
                const position = layer.position || {};
                maxRow = Math.max(maxRow, (position.row || 1) + ((position.rowspan || 1) - 1));
                maxCol = Math.max(maxCol, (position.col || 1) + ((position.colspan || 1) - 1));
            }

            const cellWidth = (availableWidth - boxPadding * (maxCol + 1)) / maxCol;
            const cellHeight = (availableHeight - labelHeight - boxPadding * (maxRow + 1)) / maxRow;

            // Draw each child layer based on its grid position
            for (const [name, childLayer] of Object.entries(childLayers)) {
                // Check depth level (assumes parentLayer tracks depth)

                const pos = childLayer.position || {row: 1, col: 1, rowspan: 1, colspan: 1};
                const childX = x + boxPadding + (pos.col - 1) * (cellWidth + boxPadding);
                const childY = y + labelHeight + boxPadding + (pos.row - 1) * (cellHeight + boxPadding);
                const childWidth = cellWidth * (pos.colspan || 1) + boxPadding * ((pos.colspan || 1) - 1);
                const childHeight = cellHeight * (pos.rowspan || 1) + boxPadding * ((pos.rowspan || 1) - 1);
                childLayer.name = childLayer.name || name;

                childLayer.depth = (parentLayer.depth || 0) + 1;
                // Recursive call to render child layers
                svgString += drawLayer(childLayer, childX, childY, childWidth, childHeight);
            }
        }
        svgString += '</g>';
        return svgString;
    };

    // Render the top-level layer rectangle
    svgContent += drawLayer(layer, 50, 50, width - 100, height - 100); // Add some outer margins for the top-level rectangle
    svgContent += `</svg>`;
    return svgContent;
}

// Generate each top-level layer's SVG
const outputDirectory = "./output_svgs";
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

for (const [layerName, layerData] of Object.entries(hierarchyData)) {
    const svgContent = generateSVG(layerData);
    const outputFile = `${outputDirectory}/${layerName.replace(/\s+/g, "_").toLowerCase()}.svg`; // Sanitize file name
    fs.writeFileSync(outputFile, svgContent, "utf8");
    console.log(`SVG file generated for top-level layer: ${layerName}`);
}