const phaseColor = {
    "Current": "#000088",
    "Future": "#008800"
};

// ... existing selectEngagement, addInteractiveCircle ...

// Build an index of phases -> layers -> aggregated engagements
function buildCustomerOverlayIndex(customer) {
    // Result shape:
    // [
    //   {
    //     "name": phase.name,
    //     phase,
    //     layers: {
    //       [layerPath]: {
    //         "name": layerPath,
    //         count,
    //         elements: [engagements...],
    //         phase,
    //         customer
    //       }
    //     }
    //   },
    //   ...
    // ]
    const phasesIndex = {};

    if (!customer?.phases) return [];

    for (const phase of Object.values(customer.phases)) {
        if (!phase?.suppliers) continue;

        const phaseKey = phase.name || 'phase';
        if (!phasesIndex[phaseKey]) {
            phasesIndex[phaseKey] = {
                "name": phaseKey,
                phase,
                customer,
                layers: {}
            };
        }
        const phaseEntry = phasesIndex[phaseKey];

        for (const supplier of Object.values(phase.suppliers)) {
            if (!supplier?.engagements) continue;

            for (const engagement of Object.values(supplier.engagements)) {
                if (!engagement.layers) continue;

                // ensure engagement knows its phase and supplier
                if (!engagement.phase) engagement.phase = phase;
                if (!engagement.supplier) engagement.supplier = supplier;
                if (!engagement.customer) engagement.customer = customer;

                for (const layerPath of engagement.layers) {
                    const layerName = String(layerPath).trim();
                    if (!layerName) continue;

                    if (!phaseEntry.layers[layerName]) {
                        phaseEntry.layers[layerName] = {
                            "name": layerName,
                            count: 0,
                            elements: [],
                            phase,
                            customer
                        };
                    }
                    const layerItem = phaseEntry.layers[layerName];
                    layerItem.count++;
                    layerItem.elements.push(engagement);
                }
            }
        }
    }

    return Object.values(phasesIndex);
}

// helper: keep only alphanumeric chars, optionally collapsing empties
function toSafeIdPart(value) {
    if (!value) return 'x';
    const cleaned = String(value).replace(/[^a-zA-Z0-9]/g, '');
    return cleaned || 'x';
}

// draw one small DOM pin inside the cell header, one per phase+layer
function renderPin(graph2DDiv, cell, item, callback) {
    if (!cell) return;

    const titleBox = cell.querySelector('.gear-layer-title');
    if (!titleBox) return;

    let pinContainer = titleBox.querySelector('.pin-container');
    if (!pinContainer) {
        pinContainer = document.createElement('div');
        pinContainer.className = 'pin-container';
        Object.assign(pinContainer.style, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '0 4px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            flexGrow: '1'
        });
        titleBox.appendChild(pinContainer);
    }

    const safePhase = toSafeIdPart(item.phase?.name || 'phase');
    const safeLayer = toSafeIdPart(item.name || 'layer');
    const pinId = `custpin${safePhase}${safeLayer}`;
    if (graph2DDiv.querySelector(`#${pinId}`)) {
        return;
    }

    const baseColor = phaseColor[item.phase?.name] || '#bb7700';

    const pin = document.createElement('div');
    pin.id = pinId;
    pin.setAttribute('phase-id', safePhase); // used for phase toggling
    pin.className = 'gear-pin';
    pin.textContent = item.count;
    Object.assign(pin.style, {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: baseColor,
        color: '#fff',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        flexShrink: '0'
    });

    const lines = item.elements.map(e => e.name).filter(Boolean);
    pin.title = lines.join('\n');

    pin.addEventListener('click', ev => {
        ev.stopPropagation();
        if (typeof callback === 'function') {
            callback(item);
        }
    });

    pinContainer.appendChild(pin);
}

// main overlay builder for customer: show all phases by default
export function applyCustomerOverlay(svgEl, customer, callback) {
    if (!customer) return;
    const phases = buildCustomerOverlayIndex(customer);
    if (!phases.length) return;

    // Remove any previous pins
    svgEl.querySelectorAll('.gear-pin').forEach(n => n.remove());

    // Aggregate by (phase, resolvedLayerName)
    const aggregated = {};

    for (const phaseEntry of phases) {
        const phaseName = phaseEntry.phase?.name || phaseEntry.name || 'phase';
        for (const layerName in phaseEntry.layers) {
            if (!Object.prototype.hasOwnProperty.call(phaseEntry.layers, layerName)) continue;

            const item = phaseEntry.layers[layerName];

            // Try full layer path first, then walk up by trimming at '-'
            let searchName = item.name;
            let cell = null;

            while (searchName && !cell) {
                cell = svgEl.querySelector(`.gear-layer-cell[data-layer-id="${searchName}"]`);
                if (cell) break;

                const idx = searchName.lastIndexOf('-');
                if (idx === -1) break; // no more parents
                searchName = searchName.substring(0, idx);
            }

            if (!cell) continue;
            const resolvedLayerName = searchName || item.name;

            // Keyed by phase + resolved layer
            const phaseKey = toSafeIdPart(phaseName);
            const aggKey = `${phaseKey}::${resolvedLayerName}`;

            if (!aggregated[aggKey]) {
                aggregated[aggKey] = {
                    cell,
                    "name": resolvedLayerName,
                    phase: phaseEntry.phase,
                    customer: phaseEntry.customer,
                    count: 0,
                    elements: []
                };
            }

            aggregated[aggKey].count += item.count || 0;
            if (item.elements && item.elements.length) {
                aggregated[aggKey].elements.push(...item.elements);
            }
        }
    }

    // Render one pin per aggregated (phase, layer)
    for (const key in aggregated) {
        if (!Object.prototype.hasOwnProperty.call(aggregated, key)) continue;
        const agg = aggregated[key];
        renderPin(svgEl, agg.cell, agg, callback);
    }
}

// entrypoint: draw pins and wire phase toggles
export function create2D(graphContainer, customer, selectNodeCallback = null) {
    // Show all phases by default
    applyCustomerOverlay(graphContainer, customer, selectNodeCallback);

    // Toggle per phase via .phase-color-circle elements
    const circles = document.querySelectorAll(`.phase-color-circle[data-phase-id]`);

    circles.forEach(circle => {
        circle.style.cursor = 'pointer';

        if (circle._phaseClickHandler) {
            circle.removeEventListener('click', circle._phaseClickHandler);
        }

        const handler = event => {
            event.stopPropagation();

            const rawPhaseId = circle.getAttribute('data-phase-id');
            if (!rawPhaseId) return;
            const phaseId = toSafeIdPart(rawPhaseId);

            const wasActive = circle.dataset.active === 'true';
            const nowActive = !wasActive;
            circle.dataset.active = nowActive.toString();

            const pins = graphContainer.querySelectorAll(`.gear-pin[phase-id="${phaseId}"]`);

            if (nowActive) {
                pins.forEach(p => (p.style.display = ''));
                circle.classList.add('is-active');
            } else {
                pins.forEach(p => (p.style.display = 'none'));
                circle.classList.remove('is-active');
            }
        };

        circle.addEventListener('click', handler);
        circle._phaseClickHandler = handler;

        if (!circle.dataset.active) {
            circle.dataset.active = 'true'; // all phases visible by default
        }
    });
}