const AIHelper = require("ailtire/src/Server/AIHelper");
const AEvent = require("ailtire/src/Server/AEvent");
const {marked} = require('marked');
const path = require('path');
const fs = require('fs');

module.exports = {
    friendlyName: 'producePDF',
    description: 'producePDF file of the partner',
    static: false, // True is for Class methods. False is for object based.
    inputs: {},

    exits: {
        json: (obj) => {
            return obj;
        }
    },

    fn: async function (obj, inputs, env) {
        // Ok this will create a md file that can be converted to other formats as required.
        // Take the partner JSON file and for each High level architecture for GEAR generate an md section for it based on the json file.
        // The output of the md should follow the following outline.
        // # Partner Name, Description based on the partner JSON file.
        // Outline of the high level architecture of GEAR and how the partner maps to it.
        // Now for each of the GEAR architecture sections create the following.
        // # GEAR Architecture name, description based on the GEAR JSON file and the partner JSON file.
        // # Identify any gaps in the partner JSON file that are not covered by the GEAR JSON file.
        // # Make any suggestions on how to fill in the gaps.
        // Finish the document with a summary of the company profile and potential areas for improvement.


        let partner = obj;
        let results = await _generateDocument(partner);
        AEvent.emit('partner.export.complete', {status: "complete", text: results});
        return results;
    }
};

async function _generateDocument(partner) {
    let layers = await Layer.instances();

    let partnerJSON = partner.convertJSON();
    // First overlay the partner information on the layers;
    let fullJSON = _layerJSON(layers);
    let mappedLayers = _mapPartnerToLayers(partnerJSON, fullJSON);
    let gearJSON = _limitJSON(mappedLayers, 2);

    // Ok this will create a md file that can be converted to other formats as required.
    // Take the partner JSON file and for each High level architecture for GEAR generate an md section for it based on the json file.
    // The output of the md should follow the following outline.
    let preface = await _generatePreface(partnerJSON, gearJSON);
    let intro = await _generateIntroduction(partnerJSON, gearJSON);

    // Now for each of the GEAR architecture sections create the following.
    let body = "";
    for (let i in fullJSON) {
        let layer = fullJSON[i];
        let layerJSON = _limitJSON([layer], 3);
        let retval = await _generateLevelSVG(partnerJSON, layerJSON);
        body += "\n\n" + await _generateLayerDocument(partnerJSON, layer) + "\n\n";
        body += "\n\n" + retval + "\n\n";
    }
    let closing = await _generateConclusion(intro, body);
    let appendix = await _generateAppendix(intro + body + closing);
    return preface + intro + body + closing + appendix;
}

async function _generatePreface(partnerJSON, gearJSON) {
    let preface = `
# Introduction

## Purpose of the Document

This document offers a comprehensive mapping of the capabilities, solutions, and services provided by ${partnerJSON.name} to the Government Enterprise Architecture Reference (GEAR). The goal is to demonstrate how ${partnerJSON.name}'s offerings align with GEAR's structured layers of enterprise architecture, enabling organizations to achieve strategic transformation, address operational challenges, and capitalize on modernization opportunities.

By clearly identifying how ${partnerJSON.name}'s solutions meet the requirements of different GEAR components, this document provides insights into specific areas of alignment, highlights opportunities for greater integration, and establishes a framework for collaborative innovation and engagement with customers.

## Scope

This analysis focuses on the core domains of enterprise architecture as defined by GEAR, including Business, Data, Application, Technology, and Security architectures. The document also incorporates considerations for governance, compliance, and scalability to help organizations effectively adopt partner solutions in alignment with GEAR principles.

Through this mapping, ${partnerJSON.name}'s ability to empower organizations with interoperable and agile solutions is highlighted, making it easier for leaders to identify relevant offerings and realize measurable benefits.

## Audience

This document is intended for:

* **Partners and Resellers:** To understand the synergies between their offerings and the GEAR framework.
* **Enterprise Architects and Leaders:** To identify ${partnerJSON.name}'s solutions that directly address architectural requirements and challenges.
* **Strategic Planners and Decision-Makers:** To explore how the adoption of ${partnerJSON.name}'s offerings can drive transformation, efficiency, and innovation.

## Methodology Overview

This mapping was conducted through:

1. An in-depth review of ${partnerJSON.name}'s key solutions, services, and technological capabilities.
2. Alignment with GEAR's architecture layers to pinpoint areas of connectivity and value.
3. A detailed analysis of how partner solutions address gaps, achieve compliance, and foster innovation.
4. Contributions from stakeholder discussions, solution inventories, and best practices for architecture alignment.

Each solution and service from ${partnerJSON.name} was assessed against the GEAR framework, ensuring a structured mapping of offerings to the relevant GEAR components.

## Structure of the Document

1. **Executive Summary**: An overview of ${partnerJSON.name}'s value proposition and how its offerings align with GEAR.
2. **GEAR Overview**: A quick introduction to the Government Enterprise Architecture Reference and its significance.
3. **Partner Offerings and GEAR Mapping**: A detailed mapping of ${partnerJSON.name}'s offerings to GEAR's architecture layers.
4. **Opportunities and Recommendations**: Analysis of value-addition opportunities, potential gaps, and areas for future alignment.
5. **Conclusion**: Summary of findings and key takeaways that highlight the advantage of leveraging ${partnerJSON.name}'s solutions.
6. **Appendix**: Supplementary resources, terminology, and additional references.

`;
    AEvent.emit('partner.export.preface', {status: "preface", text: preface});
    return preface;
}

async function _generateIntroduction(partnerJSON, gearJSON) {
    let highlevelSVG = await _generateHighLevelSVG(partnerJSON, gearJSON);
    let heading = await _generateHeading(partnerJSON, gearJSON);
    let highlevelMapping = await _generateHighlevelMap(partnerJSON, gearJSON);
    return heading + "\n\n" + highlevelSVG + "\n\n" + highlevelMapping;
}

async function _generateHeading(partnerJSON, gearJSON) {
    // # Partner Name, Description based on the partner JSON file.
    // Outline of the high level architecture of GEAR and how the partner maps to it.
    let retval = {
        name: partnerJSON.name,
        description: partnerJSON.description,
        partnerJSON: partnerJSON,
        gear: gearJSON,
    };
    let prompt = `Please generate a Markdown-formatted document that includes the following:
Level 1 - "Executive Summary for ${partnerJSON.name}":
   - Extract the **Partner Name** and a detailed **Description** from the provided \`partnerJSON\`. The description should capture the partner's purpose, mission, or key operations as defined in the JSON.
Level 1 - High-Level Outline of GEAR Architecture
   - Provide a concise explanation of the **Government Enterprise Architecture Reference (GEAR)** high-level architecture. Explain its components or layers briefly, focusing on how it supports organizational alignment, interoperability, and modernization.
Level 1- Organizational Context: Briefly describe the partner's organizational context, including:
    - Mission and Vision
    - Organizational Structure
    - Core Business Functions
    - Strategic Priorities
    - Technology Landscape Overview
    - Drivers for Alignment with GEAR
    
Level 1 - Partner Mapping to GEAR:
   - Based on the data available in \`partnerJSON\` and the GEAR structure defined in \`gearJSON\`, describe how the partner's product, services and offerings (elements) align with the components of GEAR.
   - Highlight:
     - Which parts of the GEAR framework the partner fits into from the layers of the GEAR architecture (Strategic, Operational, Process, Digital and Physical).
     - Any specific goals of alignment or integration opportunities.
     
Ensure that the response uses **Markdown** format with headings, bullet points, and any necessary code or data examples to support the explanation. Avoid speculative assumptions; rely on data provided in the \`partnerJSON\` and \`gearJSON\`.
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
    while (tries < 5) {
        tries++;
        try {
            let result = await AIHelper.ask(messages);
            AEvent.emit('partner.export.intro', {status: "intro", text: result});
            return result;
        } catch (e) {
            console.error(e);
            messages[1].content = messages[1].content.slice(0, Math.floor(messages[1].content.length * 0.9));
        }
    }
}

async function _generateHighlevelMap(partnerJSON, gearJSON) {
    // # Partner Name, Description based on the partner JSON file.

    // Outline of the high level architecture of GEAR and how the partner maps to it.
    let retval = {
        name: partnerJSON.name,
        description: partnerJSON.description,
        partnerJSON: partnerJSON,
        gearJSON: gearJSON,
    };
    let prompt = `Please generate a Markdown-formatted document that includes the following:
## Partner Mapping to GEAR
   - Based on the data available in \`partnerJSON\` and the GEAR structure defined in \`gearJSON\`, describe how the partner's products, services, and offerings (elements) align with the components of GEAR.
   - Highlight:
     - Which parts of the GEAR framework the partner fits into Strategic, Operational, Process, Digital and Physical.
     - Any specific goals of alignment or integration opportunities.
Ensure that the response uses **Markdown** format with headings, bullet points, and any necessary code or data examples to support the explanation.
Avoid speculative assumptions; rely on data provided in the \`partnerJSON\` and \`gearJSON\`.
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

    AEvent.emit('partner.export.intro', {status: "intro", text: result});
    return result;
}


async function _generateLayerDocument(partnerJSON, layer) {
    // # GEAR Architecture name, description based on the GEAR JSON file and the partner JSON file.
    // # Identify any gaps in the partner JSON file that are not covered by the GEAR JSON file.
    // # Make any suggestions on how to fill in the gaps.
    const prompt = `Please generate a Markdown-formatted document that includes the following:

1. **${layer.name} Architecture Overview**:
   - Extract the **${layer.name} Architecture from the \`gearJSON\`.
   - Provide a high-level **description** of the Layer structure, as outlined in \`gearJSON\`, and how it is relevant to the partner, based on data in \`partnerJSON\`.

2. **Partner Environment Mapping to GEAR**:
   - For each layer in \'gearJSON\' there is a elements map that shows how the partner's offerings, products and services map to the GEAR framework.
     - Describe the purpose of the layer as per the GEAR framework.
     - Map the partner's offerings, products and services, aka elements (from \`partnerJSON\`) to this GEAR architecture layer.
     - Highlight any notable **alignments**, **strengths**, or areas where the partner environment integrates well with GEAR.
     - Identify **gaps or missing elements** in the partner environment for each layer compared to the definitions in \`gearJSON\`.

   - Use subsections for each layer to ensure clarity.
   - Only include the elements that map to the layer of the GEAR architecture defined in \`gearJSON\`.
   - Highlight the strengths of the partner's offerings in each layer.

3. **Gap Summary and Recommendations**:
   - Provide an overview of **gaps or misalignments** identified across the GEAR framework layers.
   - Suggest specific **actions or recommendations** for the partner to fill these gaps and improve their alignment with the GEAR framework.

Prioritize the **Partner Offering Mapping to GEAR** section with detailed mappings for each GEAR layer. Use **Markdown headings and subheadings** to structure the content and make it easy to read and navigate.

Avoid referencing any code specifics unless critical to the explanation or mapping.
Start the text with the # LayerName
All of the sections headings should be level 2(#)
Do not use horizontal lines or other formatting to separate sections.
`;
    const inputJSON = {
        gearJSON: layer,
        partnerJSON: partnerJSON,
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
    AEvent.emit('partner.export.layer', {status: "layer", text: result});
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

    AEvent.emit('partner.export.conclusion', {status: "conclusion", text: result});
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
   - Highlight any overarching patterns or successes in the partner’s alignment with GEAR.

2. Importance of GEAR Alignment:
   - Reiterate the value of aligning with the GEAR framework, particularly in terms of modernization, interoperability, and operational efficiency.
   - Emphasize how the partner benefits from improved strategic alignment and capability.
   - Mention potential for Go to market opportunities through alignment with ecosystem partners.

3.Recommended Next Steps:
   - Provide actionable next steps the partner can take to address the identified gaps and improve their alignment with GEAR.
   - Include suggestions such as roadmaps, prioritization of initiatives, or leveraging best practices from GEAR.
   - Identify potential opportunities for collaboration with GEAR partners.

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
    AEvent.emit('partner.export.conclusion', {status: "conclusion", text: result});
    return result;
}

function _limitJSON(layers, depth) {
    if (depth === 0) return {}; // Base case: Stop recursion when depth is 0

    let retval = {};
    for (let lname in layers) {
        let subLayer = layers[lname];

        // Include the current layer in the result
        retval[lname] = {...subLayer};

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
    for (let lname in layers) {
        if (!lname.includes('-')) {
            let subLayer = layers[lname];
            retval[lname] = subLayer.convertJSON({depth: depth});
        }
    }
    return retval;
}

let idMap = {};

async function _generateLevelSVG(partnerJSON, layerJSON) {
    let retval = [];
    idMap = {};
    for (let lname in layerJSON) {
        let layer = layerJSON[lname];
        layer.name = layer.name || lname;
        retval.push(mapLayer(null, layer));
    }
    let layer = retval[0];

    retval = generateSVG(partnerJSON, layer, 3000, 1500, 2);
    AEvent.emit('partner.export.svg', {status: "svg", text: retval});
    return retval;
}

async function _generateHighLevelSVG(partnerJSON, layerJSON) {
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

    retval = generateSVG(partnerJSON, topParent, 3000, 1500, 1);
    AEvent.emit('partner.export.svg', {status: "svg", text: retval});
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

let drawElementMap = {};

function generateSVG(partner, layer, width = 3000, height = 1500, depth = 1) {

    // Clear the elementmap so we only draw the element once.
    drawElementMap = {};
    // Start the SVG container
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="font-family: Arial, sans-serif;">`;
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
    let imageName = `partner-${layer.id.replace(/ /g, '')}.svg`;
    fs.mkdirSync(path.resolve(__dirname, '../../../../.scratch'), {recursive: true});
    let fileName = path.resolve(__dirname, `../../../../.scratch/${imageName}`);
    fs.writeFileSync(fileName, svgContent);

    let retval = `![${layer.id}](/api/partner/image?id=${imageName})\n`;
    if(Object.keys(drawElementMap).length > 0) {
        let sortedMap = Object.values(drawElementMap).sort((a, b) => {
            return a.number - b.number;
        });
        retval += "> _Numbers on the diagram correspond to the offerings across GEAR layers:_\n\n";
        retval += `<div style="font-size: 0.85em">\n\n`;
        retval += `\n\n| # | Name | Description | Layer |\n| --- | --- | --- | --- |\n`;
        for (let i in sortedMap) {
            retval += `| ${sortedMap[i].number} | ${sortedMap[i].element.name} | ${sortedMap[i].element.description} | ${sortedMap[i].layer.name} |\n`;
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
    svgString += _drawPartner(parentLayer, x, y, availableWidth, availableHeight);
    svgString += '</g>';
    return svgString;
};

function _drawPartner(layer, xoffset, yoffset, width, height) {
    let retval = '';
    // find elements that match the layer in the partner
    let elements = layer.elements || {};
    let i = 0;
    let x = xoffset;
    let y = yoffset;

    // Calculate grid layout
    const elementWidth = 60; // Circle diameter + padding
    const cellWidth = elementWidth * 1.5; // Add 50% spacing
    const cellHeight = elementWidth * 1.5;

    // Calculate number of rows and columns that will fit in the available space
    const maxCols = Math.floor(width / cellWidth);
    const maxRows = Math.floor(height / cellHeight);
    const totalCells = maxRows * maxCols;

    // Place elements in grid
    for (let j in elements) {
        if (i >= totalCells) break; // Stop if we run out of space

        const element = elements[j];
        const row = Math.floor(i / maxCols);
        const col = i % maxCols;

        const cx = x + col * cellWidth + cellWidth / 2;
        const cy = y + row * cellHeight + cellHeight / 2;

        if (!drawElementMap.hasOwnProperty(element.id)) {
            drawElementMap[element.id] = {element: element};
            drawElementMap[element.id].number = Object.keys(drawElementMap).length;
            drawElementMap[element.id].layer = layer;

            const text = drawElementMap[element.id].number;
            const circle = `
        <g filter="url(#pinShadow)">
            <circle cx="${cx}" cy="${cy}" r="30" fill="url(#pinGradient)" />
            <title>${element.name}</title>
            <text x="${cx}" y="${cy}" fill="black" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </g>`;
            retval += circle;
            i++;
        }
    }
    return retval;
}

function _mapPartnerToLayers(partner, layers) {
    for (let pname in partner.elements) {
        let element = partner.elements[pname];
        let currentLayers = layers;
        for (let i in element.layers) {
            let elementLayer = element.layers[i];
            let levels = elementLayer.split('-');
            for (let l in levels) {
                let level = levels[l];
                let j = 0;
                layerKeys = Object.keys(currentLayers);
                while (currentLayers && j < layerKeys.length) {
                    if (currentLayers[layerKeys[j]].name === level) {
                        if (!currentLayers[layerKeys[j]].elements) {
                            currentLayers[layerKeys[j]].elements = [];
                        }
                        let el = {...element};
                        currentLayers[layerKeys[j]].elements.push(el);
                        currentLayers = currentLayers[layerKeys[j]].layers;
                        j = layerKeys.length; // Break out of the while loop
                    } else {
                        j++;
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
    // If the currentPartner is selected then draw it too.

    return lines;
}

function _getFontColor(hexColor) {
    if (!hexColor) {
        return "#ffffff";
    }
    hexColor = hexColor.replace('#', '');
    // Parse the RGB values
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    // Calculate brightness (using luminance formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 200) {
        return "#ffffff";
    }
    return "#000000";
}

function svgToDataURI(svg) {
    const base64 = btoa(encodeURIComponent(svg));
    return `data:image/svg+xml;base64,${base64}`;
}