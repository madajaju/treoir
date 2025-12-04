import { writable, get, derived } from "svelte/store";
import { Layer } from "../components/elements/Layer";
import { Element } from "../components/elements/Element";
import { Partner } from "../components/elements/Partner";

// Writable stores
export const currentPartner = writable(null);
export const partners = writable({}); // Ensure this is an object to match any assumptions in the derived stores

/**
 * Derived store to create partner nodes from the `partners` store.
 */
export const partnerNodes = derived(partners, ($partners) => {

    if (!$partners || Object.keys($partners).length === 0) {
        console.warn("partners store is empty or undefined.");
        return [];
    }

    const idMap = {};

    function processPartner(partner) {
        if (!partner || !partner.name || !partner.elements) {
            console.warn("Invalid partner object:", partner);
            return;
        }

        idMap[partner.name] = {
            ...partner,
            id: partner.name,
            name: partner.name,
            type: "Partner",
            _children: [],
            _view: Partner,
        };

        Object.entries(partner.elements).forEach(([_, element]) => {
            processElement(idMap[partner.name], element);
        });
    }

    function processElement(partner, element) {
        if (!partner || !element || !element.name || !element.layers) {
            console.warn("Invalid element:", element);
            return;
        }

        const id = `${partner.id}-${element.name}`;
        idMap[id] = {
            ...element,
            id,
            name: element.name,
            type: "Element",
            _children: [],
            _view: Element,
        };

        partner._children.push(idMap[id]);

        element.layers.forEach((layer) => processLayer(idMap[id], layer));
    }

    function processLayer(element, layer) {
        if (!layer) {
            console.warn("Invalid layer:", layer);
            return;
        }

        const id = `${element.id}-${layer}`;
        idMap[id] = {
            id,
            type: "Layer",
            name: layer,
            _view: Layer,
        };

        element._children.push(idMap[id]);
    }

    const result = [];
    Object.values($partners).forEach((partner) => {
        processPartner(partner);
        result.push(idMap[partner.name]);
    });

    return result;
});

/**
 * Fetches the current partner and updates the `currentPartner` store.
 */
export async function fetchCurrentPartner() {
    await fetchPartners(); // Ensure we have the latest partner data
    const partnerList = get(partners);
    const currentPartnerID = get(currentPartner)?.name;
    const currentPartnerFound = partnerList[currentPartnerID];
    if (currentPartnerFound) {
        currentPartner.set(currentPartnerFound);
    } else {
        console.error(`Current partner not found with id "${currentPartnerID}".`);
    }
}

/**
 * Fetches and updates all partners from the backend.
 */
export async function fetchPartners() {
    try {
        const response = await fetch(`/api/partner/list`);
        if (!response.ok) throw new Error("Failed to fetch partners from the server");

        const partnerObjects = await response.json();
        partners.set(partnerObjects || {}); // Always set `partners` to an object to avoid breaking assumptions
    } catch (error) {
        console.error("Error fetching partners:", error);
    }
}

/**
 * Updates the `currentPartner` store with a specific partner by ID.
 */
export async function setCurrentPartner(id) {
    await fetchPartners(); // Ensure the latest list of partners
    const partnerList = get(partners);

    const partnerFound = partnerList[id];
    if (partnerFound && partnerFound.name === id) {
        currentPartner.set(partnerFound);
    } else {
        console.error(`Partner with id "${id}" not found.`);
    }
}

/**
 * Derived store to process the current partner nodes.
 */
export const currentPartnerNodes = derived(currentPartner, ($currentPartner) => {
    if (!$currentPartner) {
        console.warn("currentPartner is null or undefined.");
        return [];
    }

    const idMap = {};

    function processPartner(partner) {
        if (!partner || !partner.name || !partner.elements) {
            console.warn("Invalid partner object in currentPartnerNodes:", partner);
            return;
        }

        idMap[partner.name] = {
            ...partner,
            id: partner.name,
            name: partner.name,
            type: "Partner",
            _children: [],
            _view: Partner,
        };

        Object.entries(partner.elements).forEach(([_, element]) => {
            processElement(idMap[partner.name], element);
        });
    }

    function processElement(partner, element) {
        if (!partner || !element || !element.name || !element.layers) {
            console.warn("Invalid element in currentPartnerNodes:", element);
            return;
        }

        const id = `${partner.id}-${element.name}`;
        idMap[id] = {
            ...element,
            id,
            name: element.name,
            type: "Element",
            _children: [],
            _view: Element,
        };

        partner._children.push(idMap[id]);

        element.layers.forEach((layer) => processLayer(idMap[id], layer));
    }

    function processLayer(element, layer) {
        if (!layer) {
            console.warn("Invalid layer in currentPartnerNodes:", layer);
            return;
        }

        const id = `${element.id}-${layer}`;
        idMap[id] = {
            id,
            type: "Layer",
            name: layer,
            _view: Layer
        };

        element._children.push(idMap[id]);
    }

    processPartner($currentPartner);

    const result = [idMap[$currentPartner.name]];
    return result;
});

function allChildrenFullyRendered(children, depth, maxDepth) {
    if (depth > maxDepth) return false;
    if (!children || children.length === 0) return false;

    // For each child, check if children are fully rendered or empty at next level
    return children.every(child => {
        const grandchildren = child._children || [];
        // If grandchildren exist, recurse deeper to check completeness
        if (grandchildren.length > 0) {
            return allChildrenFullyRendered(grandchildren, depth + 1, maxDepth);
        }
        // No grandchildren means leaf node — consider it okay
        return true;
    });
}

// Add this function to your module
function checkAndToggleLevelThreeDisplay(graph2DDiv) {
    // Find all depth-2 cells with level 3 grids
    const depth2cells = graph2DDiv.querySelectorAll('.gear-layer-cell.depth-2');

    depth2cells.forEach(cell => {
      const childrenContainer = cell.querySelector('.gear-layer-children');
      if (!childrenContainer) return;

      const level3Grid = childrenContainer.querySelector('.gear-layer-grid.depth-3');
      if (!level3Grid) return;

      // Measure available height in the children container
      const containerHeight = childrenContainer.clientHeight;

      // Measure actual rendered height of level 3 grid (content height)
      const level3Height = level3Grid.scrollHeight;

      if (level3Height > containerHeight) {
        // Not enough space, hide level 3 grid
        level3Grid.style.display = 'none';
      } else {
        // Enough space, show level 3 grid
        level3Grid.style.display = '';
      }
    });
}

function renderLayerCell(layer, depth, maxDepth, parentRows, parentCols) {
    const pos = layer.position || {};
    const row = pos.row || 1;
    const col = pos.col || 1;
    const rowspan = pos.rowspan || 1;
    const colspan = pos.colspan || 1;

    const safeName = escapeHtml(layer.name || "");
    const idAttr = layer.id ? `data-layer-id="${escapeHtml(layer.id)}"` : "";
    const nameAttr = `data-layer-name="${safeName}"`;

    const bgColor = layer.color || "#CCCCCC";

    // Decide whether to render children
    const children = layer._children || [];
    const shouldRenderChildren = 
        depth + 1 <= maxDepth && 
        children.length > 0 && 
        allChildrenFullyRendered(children, depth + 1, maxDepth);

    let html = `
      <div class="gear-layer-cell depth-${depth}"
           ${idAttr}
           ${nameAttr}
           style="
             grid-row:${row} / span ${rowspan};
             grid-column:${col} / span ${colspan};
           ">
        <div class="gear-layer-box" style="background:${bgColor};">
          <div class="gear-layer-title">
            ${safeName}
          </div>
    `;

    if (shouldRenderChildren) {
        // Nested grid inside this box
        html += `
          <div class="gear-layer-children">
            ${renderLayerGrid(children, depth + 1, maxDepth)}
          </div>
        `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
}

// In your create2DDefault function, after rendering and attaching event handlers, call:
function create2DDefault(
    graph2DDiv,
    node = null,
    selectNodeCallback = null,
    drillDownCallback = null,
    maxDepth = 3
) {
    parentContainer = graph2DDiv;

    layerNodes.subscribe((nodes) => {
        let root = {
            id: "GEAR",
            color: "#ffffff",
            name: "GEAR",
            _children: nodes
        };
        if (node) {
            root = node;
        }

        const html = generateNestedGridHTML(root, maxDepth);
        if (graph2DDiv) {
            graph2DDiv.innerHTML = html;

            // Attach click / dblclick handlers to every cell
            graph2DDiv.querySelectorAll(".gear-layer-cell").forEach((cell) => {
                cell.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const layerId =
                        cell.getAttribute("data-layer-id") ||
                        cell.getAttribute("data-layer-name");
                    if (layerId) {
                        _selectLayer(graph2DDiv, layerId, cell, selectNodeCallback);
                    }
                });

                cell.addEventListener("dblclick", (event) => {
                    event.stopPropagation();
                    const layerId = cell.getAttribute("data-layer-id");
                    if (layerId && drillDownCallback) {
                        drillDownCallback(layerId);
                    }
                });
            });

            // After rendering is done, run the dynamic size check
            checkAndToggleLevelThreeDisplay(graph2DDiv);

            // Add a ResizeObserver to check whenever the container gets resized
            const resizeObserver = new ResizeObserver(() => {
                checkAndToggleLevelThreeDisplay(graph2DDiv);
            });
            resizeObserver.observe(graph2DDiv);

            drawcustomer();
            drawpartner();
        }
    });
}