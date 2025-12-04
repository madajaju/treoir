import * as d3 from "d3";
import {getLayer, layerNodes} from '../../../stores/layerStore.js';
import {selectedNodeInfo} from "../../../stores/store.js";

$: selectedNodeInfo.subscribe((node) => {
    if(node) {
        _layerSelected(node?.id);
    }
})

let nodeSelection, linkSelection;


export function create2D(graph2DDiv, element, selectNodeCallback = null, drillDownCallback = null, level = 2) {
    layerNodes.subscribe(nodes => {
        if (!nodes || nodes.length === 0 || !graph2DDiv) return;

        // Clear previous graph
        graph2DDiv.innerHTML = "";

        // Prepare nodes and links for d3 from layers and their relationships
        const layers = nodes;
        const nodesById = new Map();
        const d3Nodes = layers.map(layer => {
            nodesById.set(layer.id, layer);
            return {
                id: layer.id,
                name: layer.name,
                description: layer.description || "",
                color: layer.color || '#4a90e2'
            };
        });

        const d3Links = [];
        layers.forEach(layer => {
            if (layer.relationships && layer.relationships.length > 0) {
                layer.relationships.forEach(rel => {
                    if (nodesById.has(rel.from) && nodesById.has(rel.to)) {
                        d3Links.push({
                            source: rel.from,
                            target: rel.to,
                            name: rel.name,
                            description: rel.description || "",
                            from: rel.from,
                            to: rel.to
                        });
                    }
                });
            }
        });

        const width = graph2DDiv.clientWidth || 800;
        const height = graph2DDiv.clientHeight || 600;
        const margin = 60;

        const svg = d3.select(graph2DDiv)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [-margin, -margin, width + margin * 2, height + margin * 2])
            .style("overflow", "visible");

        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 22)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

        const simulation = d3.forceSimulation(d3Nodes)
            .force("link", d3.forceLink(d3Links).id(d => d.id).distance(350).strength(1))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(90));

        linkSelection = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(d3Links)
            .join("line")
            .attr("stroke-width", 2);

        // Create a group for arrowheads
        const arrowGroup = svg.append("g")
            .attr("class", "arrow-heads")
            .selectAll("path")
            .data(d3Links)
            .join("path")
            .attr("fill", "#999")
            .attr("stroke", "none")
            .attr("d", "M 0,-5 L 10,0 L 0,5 Z");  // triangle arrow shape

        // Link Labels (relationship names)
        const linkLabels = svg.append("g")
            .selectAll("text")
            .data(d3Links)
            .join("text")
            .attr("font-size", 12)
            .attr("fill", "#555")
            .attr("pointer-events", "all")  // enable pointer events for hover
            .text(d => d.name);

        // Tooltip div for link (relationship) hover
        const linkTooltip = d3.select(graph2DDiv)
            .append("div")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background", "#eee")
            .style("padding", "6px 10px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("color", "#333")
            .style("display", "none")
            .style("max-width", "300px")
            .style("white-space", "normal");

        // Nodes as groups with rect + multi-line text
        nodeSelection = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .selectAll("g")
            .data(d3Nodes)
            .join("g")
            .attr("cursor", "pointer");

        const horizontalPadding = 24;
        const verticalPadding = 16;
        const lineHeight = 18;
        const fontSize = 14;
        const rectRadius = 8;

        nodeSelection.each(function(d) {
            const group = d3.select(this);
            const words = d.name.split(' ');
            const lines = [];
            for (let i = 0; i < words.length; i += 2) {
                lines.push(words.slice(i, i + 2).join(' '));
            }

            const tempTexts = group.selectAll(null)
                .data(lines)
                .join("text")
                .attr("font-family", "Arial, sans-serif")
                .attr("font-weight", "normal")
                .attr("font-size", 20)
                .style("visibility", "hidden")
                .text(d => d);

            let maxTextWidth = 0;
            tempTexts.each(function() {
                const w = this.getBBox().width;
                if (w > maxTextWidth) maxTextWidth = w;
            });
            tempTexts.remove();

            const rectWidth = maxTextWidth + horizontalPadding;
            const rectHeight = lines.length * lineHeight + verticalPadding;

            group.append("rect")
                .attr("x", -rectWidth / 2)
                .attr("y", -rectHeight / 2)
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("rx", rectRadius)
                .attr("ry", rectRadius)
                .attr("fill", d.color);

            const text = group.append('text')
                .attr('text-anchor', 'middle')
                .attr('stroke-width', "0.00")
                .attr('font-family', 'Arial, sans-serif')
                .attr('font-weight', 'normal')
                .attr('text-shadow', 'none !important')
                .attr('text-rendering', 'geometricPrecision')
                .attr('filter', 'none !important')
                .attr('font-size', 20)
                .attr('fill', "#ffffff")
                .attr('y', -rectHeight / 2 + verticalPadding + lineHeight / 2);

            lines.forEach((line, i) => {
                text.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? 0 : lineHeight)
                    .text(line);
            });
        });

        // Tooltip div for node hover
        const nodeTooltip = d3.select(graph2DDiv)
            .append("div")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background", "#eee")
            .style("padding", "6px 10px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("color", "#333")
            .style("display", "none")
            .style("max-width", "300px")
            .style("white-space", "normal");

        let selectedLayerId = null;

        nodeSelection
            .on("mouseover", (event, d) => {
                nodeTooltip.style("display", "block")
                    .html(`<strong>${d.name}</strong><br/>${d.description || 'No description'}`);
            })
            .on("mousemove", (event) => {
                const containerRect = graph2DDiv.getBoundingClientRect();

                // Calculate mouse position relative to container
                const mouseX = event.clientX - containerRect.left;
                const mouseY = event.clientY - containerRect.top;

                // Use these values for positioning tooltip with a small offset
                const offsetX = 5;
                const offsetY = 5;

                nodeTooltip.style("left", (mouseX + offsetX) + "px")
                    .style("top", (mouseY + offsetY) + "px");
            })
            .on("mouseout", () => {
                nodeTooltip.style("display", "none");
            })
            .on("click", (event, d) => {
                event.stopPropagation();
                selectedLayerId = d.id;
                _layerSelected(d.id);

                if (d.id) {
                    const layer = getLayer(d.id);
                    if (selectNodeCallback) {
                        selectNodeCallback(layer);
                    }
                }
            })
            .on("dblclick", (event, d) => {
                event.stopPropagation();
                if (drillDownCallback) drillDownCallback(d.id);
            });

        // Link label hover to show details tooltip
        linkLabels
            .on("mouseover", (event, d) => {
                linkTooltip.style("display", "block")
                    .html(`<strong>Relationship:</strong><br/>
                        From: <em>${d.from}</em><br/>
                        To: <em>${d.to}</em><br/>
                        Name: <strong>${d.name}</strong><br/>
                        Description: ${d.description || 'No description'}`);
            })
            .on("mousemove", (event) => {
                const containerRect = graph2DDiv.getBoundingClientRect();

                // Calculate mouse position relative to container
                const mouseX = event.clientX - containerRect.left;
                const mouseY = event.clientY - containerRect.top;

                // Use these values for positioning tooltip with a small offset
                const offsetX = 5;
                const offsetY = 5;

                linkTooltip.style("left", (mouseX + offsetX) + "px")
                    .style("top", (mouseY + offsetY) + "px");
            })
            .on("mouseout", () => {
                linkTooltip.style("display", "none");
            });

        svg.on("click", () => {
            selectedLayerId = null;
            resetHighlight();
            if (selectNodeCallback) selectNodeCallback(null);
        });
        nodeSelection.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        simulation.on("tick", () => {
            linkSelection.attr("x1", d => Math.round(d.source.x))
                .attr("y1", d => Math.round(d.source.y))
                .attr("x2", d => Math.round(d.target.x))
                .attr("y2", d => Math.round(d.target.y));

            // Update link labels as before
            linkLabels.attr("x", d => Math.round((d.source.x + d.target.x) / 2))
                .attr("y", d => Math.round((d.source.y + d.target.y) / 2));

            // Update nodes positions as before
            nodeSelection.attr("transform", d => `translate(${Math.round(d.x)},${Math.round(d.y)})`);

            // Calculate position and rotation for each arrow head manually
            arrowGroup.attr("transform", d => {
                const x1 = d.source.x;
                const y1 = d.source.y;
                const x2 = d.target.x;
                const y2 = d.target.y;

                // Midpoint coordinates
                const mx = Math.round((x1 + x2) / 2);
                const my = Math.round((y1 + y2) / 2);

                // Calculate angle between source and target
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                // Translate to midpoint and rotate arrow
                return `translate(${mx},${my}) rotate(${angle})`;
            });
        });


        function resetHighlight() {
            linkSelection.attr("stroke", "#999")
                .attr("stroke-opacity", 0.6);
            nodeSelection.select("rect").attr("fill", d => d.color);
            nodeSelection.selectAll("text").attr("fill", d => getContrastColor(d.color));
        }

        // Contrast color helper (black or white)
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    });
}



function _layerSelected(selectedId) {
    if(!linkSelection || nodeSelection) {return;}
    linkSelection.attr("stroke", d => {
        if (d.source.id === selectedId) return "#00ff00";
        if (d.target.id === selectedId) return "#ff0000";
        return "#999";
    })
        .attr("stroke-opacity", d => (d.source.id === selectedId || d.target.id === selectedId) ? 1 : 0.3);

    nodeSelection.select("rect")
        .attr("fill", d => d.id === selectedId ? "#ffff00" : d.color);

    nodeSelection.selectAll("text")
        .attr("fill", d => {
            if (d.id === selectedId) return "#000000"; // black on highlight
            else return getContrastColor(d.color);
        });
}


function getContrastColor(hexColor) {
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return (brightness > 140) ? '#000000' : '#ffffff';
}

export function selectLayer(graph2DDiv, layer) {
    _layerSelected(layer.id);
}
