// gear2DLayout.js - self-contained 2D layout module with CSS injected

const injectedCss = `
/* Make the outer preview scroll if content still overflows */
.graph-container {
  overflow: auto;
}

.gear-layout-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-sizing: border-box;

  display: flex;
  align-items: stretch;
  justify-content: stretch;

  /* Let this container be the clamp for height */
  min-height: 0;
  min-width: 0;
  overflow: visible;
}

/* Any grid (top-level or nested) */
.gear-layer-grid {
  box-sizing: border-box;
  border: 0px solid #ccc;
  cursor: pointer;

  /* VERY IMPORTANT: allow shrinking in flex context */
  min-height: 0;
  min-width: 0;
  height: 100%;
}



/* Top-level grid should fill the whole container */
.gear-layout-container > .gear-layer-grid {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
}

/* Each cell (for any depth) – make it stretch inside its track */
.gear-layer-cell {
  position: relative;
  padding: 2px;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  min-width: 0;
  min-height: 0;
}

/* Box that holds title + children; fill the cell, allow shrink */
.gear-layer-box {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid #333;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  min-height: 0; /* allow vertical shrink */
  overflow: hidden; /* avoid text pushing box beyond track */
}

/* Title text */
.gear-layer-title {
  text-align: center;
  padding: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 0 0 auto;
  color: white;  /* Make titles white */
}

/* Nested children area inside the box – fills remaining space, can scroll if needed */
.gear-layer-children {
  flex: 1 1 auto;
  padding: 4px;
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
  overflow: hidden; /* or 'auto' if you prefer scrollbars inside */
}

/* Nested grid fills the children area */
.gear-layer-children > .gear-layer-grid {
  width: 100%;
  height: 100%;
}

/* Per-depth font sizing – baseline, overridden by JS dynamic sizing */
.gear-layer-cell.depth-0 .gear-layer-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.gear-layer-cell.depth-1 .gear-layer-title {
  font-size: 1.4rem;
  font-weight: 500;
}

.gear-layer-cell.depth-2 .gear-layer-title {
  font-size: 1.1rem;
}

.gear-layer-cell.depth-3 .gear-layer-title {
  font-size: 0.95rem;
}

/* Selected state */
.gear-layer-cell.selected .gear-layer-box {
  background: #ffff00 !important;
  border-color: #000000;
}

.gear-layer-cell.selected .gear-layer-title {
  color: #000000;
}

/* Pin overlay container */
.gear-pin-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gear-pin {
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
`;

// Inject CSS if not already injected (guarded for SSR)
if (typeof document !== "undefined") {
    if (!document.getElementById("gear2d-layout-styles")) {
        const styleEl = document.createElement("style");
        styleEl.id = "gear2d-layout-styles";
        styleEl.textContent = injectedCss;
        document.head.appendChild(styleEl);
    }
}

import { getLayer, layerNodes } from "../../../stores/layerStore.js";
import { selectedNodeInfo } from "../../../stores/store.js";
import { currentCustomer } from "../../../stores/customerStore.js";
import { currentPartner } from "../../../stores/partnerStore.js";
import { Customer } from "../Customer/index.js";
import { Partner } from "../Partner/index.js";

let parentContainer = null;

// Reflect external selection into the UI
selectedNodeInfo.subscribe((node) => {
    if (node) {
        _layerSelected(parentContainer, node?.id);
    }
});

// Base font sizes (px) per depth. You can tweak these.
const BASE_FONT_SIZES = {
    0: 26, // root
    1: 22, // children
    2: 18, // grandchildren
    3: 16, // great-grandchildren (if you ever show them)
};

/**
 * Scale font sizes for each depth based on the available height of the container.
 * This runs after the DOM has been rendered.
 */
function applyDynamicFontSizes(container, maxDepth) {
    const layout = container.querySelector(".gear-layout-container") || container;

    // Fallback height if we can't measure
    const h = layout.clientHeight || container.clientHeight || 800;

    // Simple global scale: smaller containers shrink fonts more.
    // Clamp between 0.7x and 1.1x to avoid extremes.
    let scale = h / 900;
    if (scale < 0.7) scale = 0.7;
    if (scale > 1.1) scale = 1.1;

    for (let depth = 0; depth <= maxDepth; depth++) {
        const base = BASE_FONT_SIZES[depth] || 14;
        const sizePx = base * scale;

        layout
            .querySelectorAll(
                `.gear-layer-cell.depth-${depth} .gear-layer-title`
            )
            .forEach((titleEl) => {
                titleEl.style.fontSize = `${sizePx}px`;
                titleEl.style.lineHeight = "1.2";
            });
    }
}

/**
 * Check if a given depth "fits": no cell at that depth has its box overflowing.
 * If any box's scrollHeight > clientHeight, that depth is considered not fully visible.
 */
function depthFits(container, depth) {
    const layout = container.querySelector(".gear-layout-container") || container;
    const cells = layout.querySelectorAll(`.gear-layer-cell.depth-${depth}`);
    if (!cells.length) return true; // If no cells at this depth, it's effectively fine.

    for (const cell of cells) {
        const box = cell.querySelector(".gear-layer-box");
        if (!box) continue;

        // If the content is taller than the box, this depth doesn't fit.
        if (box.scrollHeight > box.clientHeight + 1) {
            return false;
        }
    }
    return true;
}

/**
 * Decide how many depths can be shown completely. Hide deeper levels if they don't fit.
 * We always show depth 0 and 1; we only hide from depth 2+.
 */
function adjustVisibleDepth(container, maxDepth) {
    const layout = container.querySelector(".gear-layout-container") || container;

    // We guarantee that depth 0 and 1 stay visible
    let visibleMaxDepth = Math.min(1, maxDepth);

    // Start testing from depth 2 downward; stop at first failure
    for (let depth = 2; depth <= maxDepth; depth++) {
        if (depthFits(container, depth)) {
            visibleMaxDepth = depth;
        } else {
            break;
        }
    }

    // Hide all cells deeper than visibleMaxDepth
    for (let depth = visibleMaxDepth + 1; depth <= maxDepth; depth++) {
        layout
            .querySelectorAll(`.gear-layer-cell.depth-${depth}`)
            .forEach((cell) => {
                cell.style.display = "none";
            });
    }
}

/**
 * Programmatically select a layer by name.
 */
export function selectLayer(graph2DDiv, layerName) {
    if (!graph2DDiv || !layerName) return;
    const cell = graph2DDiv.querySelector(
        `.gear-layer-cell[data-layer-name="${CSS.escape(layerName)}"]`
    );
    if (!cell) return;

    const layerId =
        cell.getAttribute("data-layer-id") || cell.getAttribute("data-layer-name");
    if (layerId) {
        _selectLayer(graph2DDiv, layerId, cell, null);
    }
}

/**
 * Main entry: render the 2D layout for GEAR or a given node.
 * Uses nested HTML + CSS Grid instead of SVG.
 */
export function create2DDefault(
    graph2DDiv,
    node = null,
    selectNodeCallback = null,
    drillDownCallback = null,
    maxDepth = 3
) {
    parentContainer = graph2DDiv;

    function drawcustomer() {
        currentCustomer.subscribe((customer) => {
            if (customer) {
                Customer.get2DView(graph2DDiv, customer, selectNodeCallback);
            }
        });
    }

    function drawpartner() {
        currentPartner.subscribe((partner) => {
            if (partner) {
                Partner.get2DView(graph2DDiv, partner, selectNodeCallback);
            }
        });
    }

    layerNodes.subscribe((nodes) => {
        let root = {
            id: "GEAR",
            color: "#ffffff",
            name: "GEAR",
            _children: nodes,
        };
        if (node) {
            root = node;
        }

        const html = generateNestedGridHTML(root, maxDepth);
        if (!graph2DDiv) return;

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

        // 1) Apply dynamic font sizes per depth (root > children > grandchildren)
        applyDynamicFontSizes(graph2DDiv, maxDepth);

        // 2) Hide deeper levels (2+) if they don't fully fit
        adjustVisibleDepth(graph2DDiv, maxDepth);

        // Re-run on resize so the layout adapts when the window/pane changes
        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                applyDynamicFontSizes(graph2DDiv, maxDepth);
                adjustVisibleDepth(graph2DDiv, maxDepth);
            });
            resizeObserver.observe(graph2DDiv);
        }

        drawcustomer();
        drawpartner();
    });
}

/* ------------------------------
   Internal selection helpers
   ------------------------------ */

function _layerSelected(container, layerId) {
    if (!container || !layerId) return;

    const idShort = layerId.split("-").pop();

    // Clear previous
    container
        .querySelectorAll(".gear-layer-cell.selected")
        .forEach((cell) => cell.classList.remove("selected"));

    // Match by full id first, then by short id, then by name
    const match =
        container.querySelector(
            `.gear-layer-cell[data-layer-id="${CSS.escape(layerId)}"]`
        ) ||
        container.querySelector(
            `.gear-layer-cell[data-layer-id="${CSS.escape(idShort)}"]`
        ) ||
        container.querySelector(
            `.gear-layer-cell[data-layer-name="${CSS.escape(idShort)}"]`
        );

    if (match) {
        match.classList.add("selected");
    }
}

function _selectLayer(container, id, cell, selectNodeCallback = null) {
    _layerSelected(container, id);
    if (selectNodeCallback) {
        const layer = getLayer(id);
        if (layer) {
            selectNodeCallback(layer);
        }
    }
}

/* ------------------------------
   Nested HTML grid generation
   ------------------------------ */

/**
 * Generate the outer HTML wrapper (root is usually the synthetic "GEAR" node).
 * We don't render root as a cell; we render its children as the top grid.
 */
function generateNestedGridHTML(root, maxDepth = 3) {
    // const topLayers = root._children || [root];
    const topLayers = [root]

    let html = `
    <div class="gear-layout-container">
      ${renderLayerGrid(topLayers, 0, maxDepth)}
      <div class="gear-pin-overlay"></div>
    </div>
  `;

    return html;
}

/**
 * Render a grid of sibling layers at a given depth.
 * This is used both for the top-level and for nested child grids.
 */
function renderLayerGrid(layers, depth, maxDepth) {
    if (!layers || !layers.length || depth > maxDepth) {
        return "";
    }
    // Determine local grid size based on children's position metadata
    let maxRow = 1;
    let maxCol = 1;
    for (const layer of layers) {
        let pos = layer.position || {};
        if(depth === 0) {
            pos = {row:1, col:1, rowspan:1, colspan:1};
        }
        const row = pos.row || 1;
        const col = pos.col || 1;
        const rowspan = pos.rowspan || 1;
        const colspan = pos.colspan || 1;
        maxRow = Math.max(maxRow, row + rowspan - 1);
        maxCol = Math.max(maxCol, col + colspan - 1);
    }

    // Build a grid map to check coverage – if not fully filled, skip this level
    // Skip the check if the depth is 0, since we always render the root layer.
       const positionMap = new Set();
       for (const layer of layers) {
           let pos = layer.position || {};
           if(depth === 0) {
               pos = {row:1, col:1, rowspan:1, colspan:1};
           }
           const row = pos.row || 1;
           const col = pos.col || 1;
           const rowspan = pos.rowspan || 1;
           const colspan = pos.colspan || 1;

           for (let r = row; r < row + rowspan; r++) {
               for (let c = col; c < col + colspan; c++) {
                   positionMap.add(`${r},${c}`);
               }
           }
       }

    let gridHtml = `
    <div class="gear-layer-grid depth-${depth}"
         style="
           display:grid;
           grid-template-rows:repeat(${maxRow}, 1fr);
           grid-template-columns:repeat(${maxCol}, 1fr);
           gap:4px;
         ">
  `;

    for (const layer of layers) {
        gridHtml += renderLayerCell(layer, depth+1, maxDepth, maxRow, maxCol);
    }

    gridHtml += `</div>`;
    return gridHtml;
}

/**
 * Render a single layer cell, with a title and (optionally) a nested child grid.
 */
function renderLayerCell(layer, depth, maxDepth, parentRows, parentCols) {
    const pos = layer.position || {};
    let row = pos.row || 1;
    let col = pos.col || 1;
    let rowspan = pos.rowspan || 1;
    let colspan = pos.colspan || 1;
    if(depth === 1) {
        row = 1;
        col = 1;
        rowspan = 1;
        colspan = 1;
    }

    const safeName = escapeHtml(layer.name || "");
    const titleName = escapeHtml(`${layer.name}\n${layer.description}` || "");
    const idAttr = layer.id ? `data-layer-id="${escapeHtml(layer.id)}"` : "";
    const nameAttr = `data-layer-name="${safeName}"`;

    const bgColor = layer.color || "#CCCCCC";

    // Decide whether to render children
    const children = layer._children || [];
    const shouldRenderChildren = depth + 1 <= maxDepth && children.length > 0;

    let html = `
    <div title="${titleName}" class="gear-layer-cell depth-${depth}"
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

/**
 * Simple HTML escape for layer names.
 */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ------------------------------
   Optional: pin overlay helper
   ------------------------------ */

/**
 * Place pins over specific layers, using absolute-positioned divs.
 * layersWithPins: [{ layerId: "id", count: 3 }, ...]
 */
export function renderPins(graph2DDiv, layersWithPins) {
    const overlay = graph2DDiv.querySelector(".gear-pin-overlay");
    const container = graph2DDiv.querySelector(".gear-layout-container");
    if (!overlay || !container) return;

    overlay.innerHTML = "";

    const containerRect = container.getBoundingClientRect();

    layersWithPins.forEach(({ layerId, count }) => {
        const cell = graph2DDiv.querySelector(
            `.gear-layer-cell[data-layer-id="${CSS.escape(layerId)}"]`
        );
        if (!cell) return;

        const rect = cell.getBoundingClientRect();

        const pin = document.createElement("div");
        pin.className = "gear-pin";
        pin.textContent = count;
        pin.style.position = "absolute";
        pin.style.top = `${rect.top - containerRect.top + 4}px`;
        pin.style.left = `${rect.right - containerRect.left - 22}px`;
        pin.style.width = "18px";
        pin.style.height = "18px";
        pin.style.borderRadius = "50%";
        pin.style.background = "#e53935";
        pin.style.color = "#fff";
        pin.style.fontSize = "11px";
        pin.style.display = "flex";
        pin.style.alignItems = "center";
        pin.style.justifyContent = "center";
        pin.style.pointerEvents = "none";
        pin.style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)";

        overlay.appendChild(pin);
    });
}
