const AIHelper = require("ailtire/src/Server/AIHelper");
const AEvent = require("ailtire/src/Server/AEvent");
const {marked} = require('marked');
const path = require('path');
const fs = require('fs');

module.exports = {
    friendlyName: 'producePDF',
    description: 'producePDF file of the customer',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => {
            return obj;
        }
    },

    fn: async function (obj, inputs, env) {
        // Ok this will create a md file that can be converted to other formats as required.
        // Take the customer JSON file and for each High level architecture for GEAR generate an md section for it based on the json file.
        // The output of the md should follow the following outline.
        // # Customer Name, Description based on the customer JSON file.
        // Outline of the high level architecture of GEAR and how the customer maps to it.
        // Now for each of the GEAR architecture sections create the following.
        // # GEAR Architecture name, description based on the GEAR JSON file and the customer JSON file.
        // # Identify any gaps in the customer JSON file that are not covered by the GEAR JSON file.
        // # Make any suggestions on how to fill in the gaps.
        // Finish the document with a summary of the company profile and potential areas for improvement.


        let customer = obj;
        let results = await _generateDocument(customer);
        AEvent.emit('customer.export.complete', { status: "complete", text: results});
        return results;
    }
};

async function _generateDocument(customer) {
    let layers = await Layer.instances();

    let customerJSON = customer.convertJSON();
    // First overlay the customer information on the layers;
    let fullJSON = _layerJSON(layers);
    let mappedLayers = _mapCustomerToLayers(customerJSON, fullJSON);
    let gearJSON = _limitJSON(mappedLayers, 2);

    // Ok this will create a md file that can be converted to other formats as required.
    // Take the customer JSON file and for each High level architecture for GEAR generate an md section for it based on the json file.
    // The output of the md should follow the following outline.
    let preface = await _generatePreface(customerJSON, gearJSON);
    let intro = await _generateIntroduction(customerJSON, gearJSON);

    // Now for each of the GEAR architecture sections create the following.
    let body = "";
    for(let i  in fullJSON) {
        let layer = fullJSON[i];
        let layerJSON = _limitJSON([layer], 3);
        let retval = await _generateLevelSVG(customerJSON, layerJSON);
        body += "\n\n" + await _generateLayerDocument(customerJSON, layer) + "\n\n";
        body += "\n\n" + retval + "\n\n";
    }
    let closing = await _generateConclusion(intro, body);
    let appendix = await _generateAppendix(intro + body + closing);
    return preface + intro + body + closing + appendix;
}
async function _generatePreface(customerJSON, gearJSON) {
    let preface = `
# Introduction
## Purpose of the Document

This document provides a structured mapping between the capabilities, functions, and organizational components of ${customerJSON.name} and the Government Enterprise Architecture Reference (GEAR). The objective is to alignment, understand, unify, leverage and augment current environments. This will help identify capability gaps, and support strategic planning and modernization efforts.

## Scope

This analysis spans the core domains of enterprise architecture—including Business, Data, Application, and Technology Architectures—and considers policy, security, and governance overlays as defined by the GEAR. It is intended to guide enterprise transformation and improve interoperability, agility, and efficiency across departments and systems.

## Audience

This document is intended for enterprise architects, CIOs, transformation leads, and policymakers who are engaged in aligning organizational capabilities with federal and global enterprise architecture standards.

## Methodology Overview

The mapping approach includes a structured review of existing artifacts, stakeholder interviews, system inventories, and architectural documentation. Each organizational element is assessed against GEAR reference layers and principles.

## Structure of the Document

1. Executive Summary
2. Overview of GEAR
3. Organizational Context
4. GEAR Mappings
5. Gap analysis & Recommendations
6. Appendix (Terminology, Artifacts, and maps)
`;
    AEvent.emit('customer.export.preface', { status: "preface", text: preface});
    return preface;
}
async function _generateIntroduction(customerJSON, gearJSON) {
    let highlevelSVG = await _generateHighLevelSVG(customerJSON, gearJSON);
    let heading = await _generateHeading(customerJSON, gearJSON);
    let highlevelMapping = await _generateHighlevelMap(customerJSON, gearJSON);
    return heading + "\n\n" + highlevelSVG + "\n\n" + highlevelMapping;
}
async function _generateHeading(customerJSON, gearJSON) {
    // # Customer Name, Description based on the customer JSON file.
    // Outline of the high level architecture of GEAR and how the customer maps to it.
    let retval = {
        name: customerJSON.name,
        description: customerJSON.description,
        customerJSON: customerJSON,
        gear: gearJSON,
    };
    let prompt = `Please generate a Markdown-formatted document that includes the following:
Level 1 - "Executive Summary for ${customerJSON.name}":
   - Extract the **Customer Name** and a detailed **Description** from the provided \`customerJSON\`. The description should capture the customer's purpose, mission, or key operations as defined in the JSON.
Level 1 - High-Level Outline of GEAR Architecture
   - Provide a concise explanation of the **Government Enterprise Architecture Reference (GEAR)** high-level architecture. Explain its components or layers briefly, focusing on how it supports organizational alignment, interoperability, and modernization.
Level 1- Organizational Context: Briefly describe the customer's organizational context, including:
    - Mission and Vision
    - Organizational Structure
    - Core Business Functions
    - Strategic Priorities
    - Technology Landscape Overview
    - Drivers for Alignment with GEAR
    
Level 1 - Customer Mapping to GEAR:
   - Based on the data available in \`customerJSON\` and the GEAR structure defined in \`gearJSON\`, describe how the customer's operations, objectives, or structures align with the components of GEAR.
   - Highlight:
     - Which parts of the GEAR framework the customer fits into (e.g., strategic, organizational, process, digital, and physical).
     - Any specific goals of alignment or integration opportunities.
     
Ensure that the response uses **Markdown** format with headings, bullet points, and any necessary code or data examples to support the explanation. Avoid speculative assumptions; rely on data provided in the \`customerJSON\` and \`gearJSON\`.
Start the headings at level 1(#).
Do not reference the JSON file or include it in your analysis.
Do not use horizontal lines or other formatting to separate sections.
`;

    let messages = [];

    messages.push({
        role: 'system',
        content: prompt,
    });
    messages.push({
        role: 'user',
        content: JSON.stringify(retval, null, 4),
    });
    let tries = 0;
    while(tries < 5) {
        tries++;
        try {
            let result = await AIHelper.ask(messages);
            AEvent.emit('customer.export.intro', {status: "intro", text: result});
            return result;
        } catch (e) {
            console.error(e);
            messages[1].content = messages[1].content.slice(0, Math.floor(messages[1].content.length * 0.9));
        }
    }
}

async function _generateHighlevelMap(customerJSON, gearJSON) {
    // # Customer Name, Description based on the customer JSON file.

    // Outline of the high level architecture of GEAR and how the customer maps to it.
    let retval = {
        name: customerJSON.name,
        description: customerJSON.description,
        customerJSON: customerJSON,
        gearJSON: gearJSON,
    };
    let prompt = `Please generate a Markdown-formatted document that includes the following:
## Customer Mapping to GEAR
   - Based on the data available in \`customerJSON\` and the GEAR structure defined in \`gearJSON\`, describe how the customer's operations, objectives, or structures align with the components of GEAR.
   - Highlight:
     - Which parts of the GEAR framework the customer fits into (e.g., strategic, organizational, process, digital, and physical).
     - Any specific goals of alignment or integration opportunities.
Ensure that the response uses **Markdown** format with headings, bullet points, and any necessary code or data examples to support the explanation.
Avoid speculative assumptions; rely on data provided in the \`customerJSON\` and \`gearJSON\`.
Do not use horizontal lines or other formatting to separate sections.
`;
    let messages = [];
    messages.push({
        role: 'system',
        content: prompt,
    });
    messages.push({
        role: 'user',
        content: JSON.stringify(retval, null, 4),
    });
    let result = await AIHelper.ask(messages);

    AEvent.emit('customer.export.intro', { status: "intro", text: result});
    return result;
}


async function _generateLayerDocument(customerJSON, layer) {
    // # GEAR Architecture name, description based on the GEAR JSON file and the customer JSON file.
    // # Identify any gaps in the customer JSON file that are not covered by the GEAR JSON file.
    // # Make any suggestions on how to fill in the gaps.
    const prompt = `Please generate a Markdown-formatted document that includes the following:

1. **${layer.name} Architecture Overview**:
   - Extract the **${layer.name} Architecture from the \`gearJSON\`.
   - Provide a high-level **description** of the Layer structure, as outlined in \`gearJSON\`, and how it is relevant to the customer, based on data in \`customerJSON\`.

2. **Customer Environment Mapping to GEAR**:
   - For each layer in \'gearJSON\' there is a engagement map that shows how the customer's environment maps to the GEAR framework.
     - Describe the purpose of the layer as per the GEAR framework.
     - Map the customer's **current environment** or operational details (from \`customerJSON\`) to this GEAR architecture layer.
     - Highlight any notable **alignments**, **strengths**, or areas where the customer environment integrates well with GEAR.
     - Identify **gaps or missing elements** in the customer environment for each layer compared to the definitions in \`gearJSON\`.

   - Use subsections for each layer to ensure clarity.
   - Only include the elements that map to the layer of the GEAR architecture defined in \`gearJSON\`.

3. **Gap Summary and Recommendations**:
   - Provide an overview of **gaps or misalignments** identified across the GEAR framework layers.
   - Suggest specific **actions or recommendations** for the customer to fill these gaps and improve their alignment with the GEAR framework.

Prioritize the **Customer Environment Mapping to GEAR** section with detailed mappings for each GEAR layer. Use **Markdown headings and subheadings** to structure the content and make it easy to read and navigate.

Avoid referencing any code specifics unless critical to the explanation or mapping.
Start the text with the # LayerName
All of the sections headings should be level 2(#)
Do not use horizontal lines or other formatting to separate sections.
`;
    const inputJSON = {
        gearJSON: layer,
        customerJSON: customerJSON,
    }
    let messages = [];
    messages.push({
        role: 'system',
        content: prompt,
    });
    messages.push({
        role: 'user',
        content: JSON.stringify(inputJSON, null, 4),
    });
    let result = await AIHelper.ask(messages);
    AEvent.emit('customer.export.layer', { status: "layer", text: result});
    return result;
}

async function _generateAppendix(body) {
    const prompt = `Based on the user prompt create an Appendix with the following sections:
Terminology
Artifacts

All of the headings should be at level 2(#)
`
    let messages = [];
    messages.push({
        role: 'system',
        content: prompt,
    });
    messages.push({
        role: 'user',
        content: body,
    });
    let result = await AIHelper.ask(messages);
    result = "# Appendix\n\n" + result;

    AEvent.emit('customer.export.conclusion', { status: "conclusion", text: result});
    return result;
}

async function _generateConclusion(intro, body) {
    const prompt = `Based on the introduction and the layer analysis provided in the document, generate a conclusion that includes the following:

1. Summary of Key Findings:
   - Summarize the strengths and gaps identified in the layer analysis for each of the four GEAR architecture components:
     - **Strategic Architecture**
     - **Organizational Architecture**
     - **Process Architecture**
     - **Digital Architecture**
     - **Physical Architecture**
   - Highlight any overarching patterns or successes in the customer’s alignment with GEAR.

2. Importance of GEAR Alignment:
   - Reiterate the value of aligning with the GEAR framework, particularly in terms of modernization, interoperability, and operational efficiency.
   - Emphasize how the customer benefits from improved strategic alignment and capability.

3.Recommended Next Steps:
   - Provide actionable next steps the customer can take to address the identified gaps and improve their alignment with GEAR.
   - Include suggestions such as roadmaps, prioritization of initiatives, or leveraging best practices from GEAR.

Structure the conclusion using **Markdown**, with proper headings, bullet points, and concise language that aligns with professional documentation style.
Their should be a  level one heading for the conclusion # Conclusion.
All of the other heading should be at level 2(#)
`
    let messages = [];
    messages.push({
        role: 'system',
        content: prompt,
    });
    messages.push({
        role: 'user',
        content: intro + body,
    });
    let result = await AIHelper.ask(messages);
    AEvent.emit('customer.export.conclusion', { status: "conclusion", text: result});
    return result;
}

function _limitJSON(layers, depth) {
    if (depth === 0) return {}; // Base case: Stop recursion when depth is 0

    let retval = {};
    for (let lname in layers) {
        let subLayer = layers[lname];

        // Include the current layer in the result
        retval[lname] = { ...subLayer };

        // Remove child layers if we've reached the desired depth
        if (depth > 1 && subLayer.layers) {
            retval[lname].layers = _limitJSON(subLayer.layers, depth - 1);
        } else {
            delete retval[lname].layers; // Remove layers property if depth is exceeded
        }
    }
    return retval;
}

function _layerJSON(layers, depth) {
    let retval = {};
    for(let lname in layers) {
        if(!lname.includes('-')) {
            let subLayer = layers[lname];
            retval[lname] = subLayer.convertJSON({depth:depth});
        }
    }
    return retval;
}

let idMap = {};
async function _generateLevelSVG(customerJSON, layerJSON) {
    let retval = [];
    idMap = {};
    for (let lname in layerJSON) {
        let layer = layerJSON[lname];
        layer.name = layer.name || lname;
        retval.push(mapLayer(null, layer));
    }
    let layer = retval[0];

    retval = generateSVG(customerJSON, layer);
    AEvent.emit('customer.export.svg', { status: "svg", text: retval});
    return retval;
}
async function _generateHighLevelSVG(customerJSON, layerJSON) {
    let retval = [];
    idMap = {};
    for (let lname in layerJSON) {
        let layer = layerJSON[lname];
        layer.name = layer.name || lname;
        retval.push(mapLayer(null, layer));
    }
    let topParent = {
        name: "GEAR",
        id: "GEAR",
        color: "#ffffff",
        type: 'Layer',
        _children: retval,
        _view: Layer
    }

    retval = generateSVG(customerJSON, topParent);
    AEvent.emit('customer.export.svg', { status: "svg", text: retval});
    return retval;
}
function mapLayer(parent, layer) {
    let id = parent ? parent.id + '-' + layer.name : layer.name;
    idMap[id] = {
        ...layer,
        id: id,
        type: 'Layer',
        _children: [],
        _view: Layer
    };
    if (parent) {
        idMap[id].parent = parent;
        parent._children.push(idMap[id]);
    }
    for (let cname in layer.layers) {
        layer.layers[cname].name = layer.layers[cname].name || cname;
        mapLayer(idMap[id], layer.layers[cname]);
    }
    return idMap[layer.name];
}

function generateSVG(customer, layer, width = 3000, height = 1500, depth = 1) {
    // Start the SVG container
    drawElementMap = {};
    let svgContent =`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="font-family: Arial, sans-serif;">`;
    svgContent += `
<defs>
    <radialGradient id="pinGradient" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ff0" stop-opacity="1.0"/>
        <stop offset="100%" stop-color="#aa0"/>
    </radialGradient>
    <filter id="pinShadow" x="-20%" y="-20%" width="440%" height="440%">
        <feDropShadow dx="9" dy="9" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>
    </filter>
</defs>
`


    svgContent += `<rect width="100%" height="100%" fill="white"/>`; // Background

    // Recursive function to draw a layer and its children using grid layout

    // Render the top-level layer rectangle
    svgContent += drawLayer(layer, 50, 50, width - 100, height - 100, depth); // Add some outer margins for the top-level rectangle
    svgContent += `</svg>`;
    let imageName = `customer-${layer.id.replace(/ /g, '')}.svg`;
    fs.mkdirSync(path.resolve(__dirname, '../../../../.scratch'), {recursive: true});
    let fileName = path.resolve(__dirname, `../../../../.scratch/${imageName}`);
    fs.writeFileSync(fileName, svgContent);

    let retval = `![${layer.id}](/api/customer/image?id=${imageName})\n`;
    if(Object.keys(drawElementMap).length > 0) {
        let sortedMap = Object.values(drawElementMap).sort((a, b) => {
            return a.number - b.number;
        });
        retval += "> _Numbers on the diagram correspond to the offerings across GEAR layers:_\n\n";
        retval += `<div style="font-size: 0.85em">\n\n`;
        retval += `\n\n| # | Name | Description | Supplier | Layer |\n| --- | --- | --- | --- | --- |\n`;
        for (let i in sortedMap) {
            retval += `| ${sortedMap[i].number} | ${sortedMap[i].engagement.name} | ${sortedMap[i].engagement.description} | ${sortedMap[i].engagement.supplier.name} | ${sortedMap[i].layer.name} |\n`;
        }
        retval += `\n\n</div>\n`;
    }
    retval += '\n'
    return retval;
}

const drawLayer = (parentLayer, x, y, availableWidth, availableHeight, depth, currentDepth = 0, peerFontSize = null) => {
    const defaultFontSize = {
        0: 84,
        1: 64,
        2: 48,
        3: 32,
        4: 24,
        5: 16,
    }
    let totalHeight = availableHeight + 100;
    const boxPadding = 10; // Padding between grid cells and edge inside rectangles
    const baseFontSize = totalHeight / 20;
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
    let fontSize = defaultFontSize[currentDepth];
    let labelHeight = fontSize + 8;

    // How do I check if the labelHeight is larger than the rectangle

    // Draw the parent rectangle
    let svgString = `<g class="layer-group" ><title>${parentLayer.name.replace(/&/g, '')}</title>`;
    svgString += `<rect x="${x}" y="${y}" width="${availableWidth}" height="${availableHeight}" fill="${color}" stroke="#333" stroke-width="2" rx="10" ry="10"/>`;

    // If there are children and the current depth is the same as the depth
    // then limit the availableHeight to labelHeight*2
    let maxLabelHeight = availableHeight;
    if(numChildren > 0 && currentDepth !== depth) {
        maxLabelHeight = labelHeight * 2;
    }

    // Wrap and render the label inside the rectangle at the top
    let lines = wrapText(parentLayer.name.replace(/&/g, ''), availableWidth - (2 * boxPadding), fontSize);
    while (lines.length * (fontSize + 8) > maxLabelHeight && fontSize > 12) {
        // Adjust font size if needed
        fontSize -= 1;
        lines = wrapText(parentLayer.name.replace(/&/g, ''), availableWidth - 2 * boxPadding, fontSize);
    }
    labelHeight = lines.length * (fontSize + 8);

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
    svgString += _drawCustomer(parentLayer, x, y, availableWidth, availableHeight);
    svgString += '</g>';
    return svgString;
};
function _drawCustomer(layer, xoffset, yoffset, width, height) {

    let retval = '';
    // find elements that match the layer in the customer
    let engagements = layer.engagements || {};
    let i = 0;
    let x = xoffset;
    let y = yoffset;

    // Calculate grid layout
    const engagementWidth = 60; // Circle diameter + padding
    const cellWidth = engagementWidth * 1.5; // Add 50% spacing
    const cellHeight = engagementWidth * 1.5;

    // Calculate number of rows and columns that will fit in the available space
    const maxCols = Math.floor(width / cellWidth);
    const maxRows = Math.floor(height / cellHeight);
    const totalCells = maxRows * maxCols;
    for (let j in engagements) {
        if (i >= totalCells) break; // Stop if we run out of space

        const engagement = engagements[j];
        const row = Math.floor(i / maxCols);
        const col = i % maxCols;

        const cx = x + col * cellWidth + cellWidth / 2;
        const cy = y + row * cellHeight + cellHeight / 2;

        if (!drawElementMap.hasOwnProperty(engagement.id)) {
            drawElementMap[engagement.id] = {engagement: engagement};
            drawElementMap[engagement.id].number = Object.keys(drawElementMap).length;
            drawElementMap[engagement.id].layer = layer;

            const text = drawElementMap[engagement.id].number;
            const circle = `
        <g filter="url(#pinShadow)">
            <circle cx="${cx}" cy="${cy}" r="30" fill="url(#pinGradient)" />
            <title>${engagement.name}</title>
            <text x="${cx}" y="${cy}" fill="black" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </g>`;
            retval += circle;
            i++;
        }
    }
    return retval;
}

function _mapCustomerToLayers(customer, layers) {
    for(let pname in customer.phases) {
        let phase = customer.phases[pname];
        for(let sname in phase.suppliers) {
            let  supplier = phase.suppliers[sname];
            for(let ename in supplier.engagements) {
                let engagement = supplier.engagements[ename];
                let currentLayers = layers;
                for(let i in engagement.layers) {
                    let engagementLayer = engagement.layers[i];
                    let levels = engagementLayer.split('-');
                    for(let l in levels) {
                        let level = levels[l];
                        let j = 0;
                        layerKeys = Object.keys(currentLayers);
                        while(currentLayers && j < layerKeys.length) {
                            if(currentLayers[layerKeys[j]].name === level) {
                                if(!currentLayers[layerKeys[j]].engagements) {
                                    currentLayers[layerKeys[j]].engagements = [];
                                }
                                let engage = {...engagement, phase:{name:phase.name,color:phase.color}, supplier: {name:supplier.name}};
                                engage.customer ={};
                                currentLayers[layerKeys[j]].engagements.push(engage);
                                currentLayers = currentLayers[layerKeys[j]].layers;
                                j = layerKeys.length; // Break out of the while loop
                            } else {
                                j++;
                            }
                        }
                    }
                }
            }
        }
    }
    return layers;
}
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
function _getFontColor(hexColor) {
    if(!hexColor) {
        return "#ffffff";
    }
    hexColor = hexColor.replace('#', '');
    // Parse the RGB values
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    // Calculate brightness (using luminance formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if(brightness < 200) {
        return "#ffffff";
    }
    return "#000000";
}

function svgToDataURI(svg) {
    const base64 = btoa(encodeURIComponent(svg));
    return `data:image/svg+xml;base64,${base64}`;
}