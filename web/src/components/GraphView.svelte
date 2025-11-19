<script>
    export let defaultView;
    export let currentView;
    export let id;

    import {onMount,tick} from "svelte";
    import {graph} from "../stores/store.js"
    import {highlightedLayer, selectedNode, selectedValue, selectedNodeInfo, selectedClass, selectedClassList} from "../stores/store.js"
    import {getLayer, layers, layerNodes} from "../stores/layerStore.js"
    import Menu from "./Menu.svelte";
    import {GraphThree} from '../lib/ailtire/GraphThree';

    let graphData = {};

    let graphRef; // Reference for the graph container
    let graph2DRef; // Reference for the graph container
    let graphObj;
    let graph2D = "<p>Not Available</p>";
    let graphView = "2D";
    let selectedLayer = null;

    // Render the 3D Graph on mount
    onMount(async () => {
        totalMenu.push(...menu3DItems);
        if (graphRef) {
            let graph3DDiv = document.getElementById('preview3d');
            graphObj = new GraphThree(graph3DDiv);
            graph.set(graphObj);
        }
        if(graph2DRef) {
            graph2D = 'Fetching the diagram';
            let graph2DDiv = document.getElementById('preview2d');
            graph2DDiv.innerHTML = graph2D;
        }
        updateGraphData(null);
    });
    $: if ($selectedNode) {
        updateGraphData($selectedNode);
    }
    $: if ($selectedClass) {
        updateGraphDataWithList($selectedNode, $selectedClassList);
    }
    $: if ($highlightedLayer) {
        updateGraphHighlight($highlightedLayer);
    }
    $: if(graphView === '2D') {
        waitForPreview2DAndUpdateGraph();
    }
    $: if(graphView === '3D') {
        waitForPreview2DAndUpdateGraph();
    }

    async function waitForPreview2DAndUpdateGraph() {
        // Wait for the DOM to update (for preview2D div to be rendered)
        await tick();
        updateGraphData($selectedNode);
    }
    async function updateGraphDataWithList(node, classList) {

        if (graphView === '3D') {
            if(node && node.id !== 'GEAR') {
                if (node._view?.hasOwnProperty('get3DView')) {
                    let data = node._view.get3DView(node);
                    graphObj?.setData(data.nodes, data.links);
                } else {
                    let data = {nodes: {}, links: []};
                    data.nodes[node.id] = {id: node.id, name: node.name, color: node.color};
                    data.links.push({source: node.id, target: node.id});
                    graphObj?.setData(data.nodes, data.links);
                }
            } else {
                let data = defaultView.default3DView();
                graphObj?.setData(data.nodes, data.links);
            }
        } else {
            if(node && node.id !== 'GEAR') {
                if (node._view?.hasOwnProperty('get2DView')) {
                    graph2D = 'Fetching the diagram';
                    let graph2DDiv = document.getElementById('preview2d');
                    node._view.get2DView(graph2DDiv, node, selectNode, drillDown);
                } else {
                    graph2D = "Not Available!";
                }
            } else {
                graph2D = 'Fetching the diagram';
                let graph2DDiv = document.getElementById('preview2d');
                defaultView.default2DView(graph2DDiv, selectNode, drillDown);
            }
        }
    }
    async function updateGraphHighlight(node) {

        totalMenu = [];
        if(node) {
            if (node._view?.hasOwnProperty('getMenu')) {
                let menu = node._view.getMenu();
                for (let i in menu) {
                    totalMenu.push(menu[i]);
                }
            }
        }
        if (graphView === '3D') {
            totalMenu = [];
            for (let i in menu3DItems) {
                totalMenu.push(menu3DItems[i]);
            }
            if(node) {
                if (node._view?.hasOwnProperty('get3DView')) {
                    let data = node._view.get3DView(node);
                    graphObj?.setData(data.nodes, data.links);
                } else {
                    let data = {nodes: {}, links: []};
                    data.nodes[node.id] = {id: node.id, name: node.name, color: node.color};
                    data.links.push({source: node.id, target: node.id});
                    graphObj?.setData(data.nodes, data.links);
                }
            } else {
                defaultView.default3DView(graphObj, level);
            }
        } else {
            totalMenu = [];
            for (let i in menu2DItems) {
                totalMenu.push(menu2DItems[i]);
            }
            if(node) {
                if (node._view?.hasOwnProperty('get2DView')) {
                    graph2D = 'Generating the diagram';
                    let graph2DDiv = document.getElementById('preview2d');
                    node._view.selectLayer(graph2DDiv, node, selectNode, drillDown);
                } else {
                    graph2D = "Not Available!";
                }
            } else {
                graph2D = 'Generating the diagram';
                let graph2DDiv = document.getElementById('preview2d');
                defaultView.selectLayer(graph2DDiv, selectNode, drillDown);
            }
        }
    }
    async function updateGraphData(node, level=2) {

        totalMenu = [];
        if(node) {
            if (node._view?.hasOwnProperty('getMenu')) {
                let menu = node._view.getMenu();
                for (let i in menu) {
                    totalMenu.push(menu[i]);
                }
            }
        }
        if (graphView === '3D') {
            totalMenu = [];
            for (let i in menu3DItems) {
                totalMenu.push(menu3DItems[i]);
            }
            if(node) {
                if (node._view?.hasOwnProperty('get3DView')) {
                    let data = node._view.get3DView(node);
                    graphObj?.setData(data.nodes, data.links);
                } else {
                    let data = {nodes: {}, links: []};
                    data.nodes[node.id] = {id: node.id, name: node.name, color: node.color};
                    data.links.push({source: node.id, target: node.id});
                    graphObj?.setData(data.nodes, data.links);
                }
            } else {
                defaultView.default3DView(graphObj, level);
            }
        } else {
            buildBreadcrumb(node);
            totalMenu = [];
            for (let i in menu2DItems) {
                totalMenu.push(menu2DItems[i]);
            }
            if(node && node.id !== 'GEAR') {
                if (node._view?.hasOwnProperty('get2DView')) {
                    graph2D = 'Generating the diagram';
                    let graph2DDiv = document.getElementById('preview2d');
                    node._view.get2DView(graph2DDiv, node, selectNode, drillDown, level);
                } else {
                    graph2D = "Not Available!";
                }
            } else {
                graph2D = 'Generating the diagram';
                let graph2DDiv = document.getElementById('preview2d');
                defaultView.default2DView(graph2DDiv, selectNode, drillDown, level);
            }
        }
    }

    let totalMenu = [];
    const menu2DItems = [];
    const menu3DItems = [];
    let rootLayer = null;


    function handleMenuClick(kitem) {
    }
    function selectNode(node) {
        selectedNodeInfo.set(node);
    }

    function buildBreadcrumb(layer) {
        // Build array from root -> ... -> current
        const chain = [];
        if(!layer) { return; }
        let myLayers = layer.id.split('-');
        let id = [];
        for(let i in myLayers) {
            id.push(myLayers[i]);
            chain.push({name: myLayers[i], id: id.join('-')});
        }
        const breadcrumbEl = document.getElementById('breadcrumb');

        breadcrumbEl.innerHTML = '';
        chain.forEach((node, idx) => {
            const btn = document.createElement('span');
            btn.className = 'breadcrumbItem';
            btn.textContent = node.name || 'GEAR';
            btn.setAttribute('aria-current', idx === chain.length - 1 ? 'page' : 'false');
            btn.addEventListener('click', () => {
                drillDown(node.id);
            });
            breadcrumbEl.appendChild(btn);

            if (idx < chain.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'sep';
                sep.textContent = '>';
                breadcrumbEl.appendChild(sep);
            }
        });

        // Ensure top “GEAR”
        if (!chain.length || chain[0].name !== 'GEAR') {
            const btn = document.createElement('span');
            btn.type = 'span';
            btn.className = 'breadcrumbItem';
            btn.textContent = 'GEAR';
            btn.addEventListener('click', () => {
                // rootLayer = layers
                //buildBreadcrumb(layers);
                selectedNode.set({id: "GEAR", name: "GEAR", _children: $layers})
                selectedValue.set(null);
                selectNode({id: "GEAR", name: "GEAR", _children: $layers});
                updateGraphData($selectedNode);
            });
            breadcrumbEl.prepend(btn, Object.assign(document.createElement('span'), {
                className: 'sep',
                textContent: '›'
            }));
        }
    }
    function _findLayer(gdxa, layerName) {
        if (!gdxa || !layerName) return null;
        if (gdxa.id === layerName) {
            return gdxa;
        }
        if (gdxa._children) {
            for (const layer of Object.values(gdxa._children)) {
                const item = _findLayer(layer, layerName);
                if (item) {
                    return item;
                }
            }
        }
        return null;
    }
    function drillDown(layerName) {
        const target = _findLayer({_children: $layerNodes}, layerName);
        if (target) {
            selectedNode.set(target);
            selectedValue.set(null);
            selectNode(target);
            updateGraphData($selectedNode);
        }
    }
</script>

<style>
    svg {
        width: 100%; /* Scales to the width of the container */
        height: 100%; /* Scales to the height of the container */
        max-width: 100%; /* Ensure it does not exceed container width */
        max-height: 100%; /* Ensure it does not exceed container height */
        object-fit: contain; /* Ensures the aspect ratio is preserved */
    }
    #breadcrumb {
        font-size: 1.2rem;
        font-weight: 600;
        color: #123456;
    }

    :global(.breadcrumbItem) {
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        transition: background-color 0.2s ease;
    }
    :global(.breadcrumbItem:hover) {
        background-color: rgba(18, 52, 86, 0.1);
        color: #0055aa;
    }

    .graph-container {
        width: 100%;
        height: 100%;
        position: relative; /* This ensures proper layout handling */
    }
    #preview2d {
        width: 100%;
        height: 100%;
        padding: 0px;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
    }

    /* Ensure the parent container also uses a size */
    .parent-container {
        height: 100%; /* 100% of the page viewport */
        overflow: hidden; /* Prevent unnecessary scrollbars */
    }

    :global(svg .layer-group) {
        cursor: pointer; /* Optional: Show pointer for clickable items */
    }

    .layer-group .highlighted rect {
        stroke: yellow !important; /* Highlight outline */
        stroke-width: 3;
    }

    .layer-group .highlighted text {
        fill: black !important;
    }
</style>
<!-- Container for the 3D Graph -->
<div class="parent-container">
    {#if totalMenu.length > 0}
        <Menu bind:menuItems={totalMenu} {handleMenuClick}></Menu>
    {/if}
    {#if graphView === '3D'}
        <div bind:this={graphRef} id="preview3d" class="graph-container"></div>
    {:else}
        <div id="navigation-ribbon" aria-label="Breadcrumb">
            <nav id="breadcrumb"></nav>
        </div>
        <div bind:this={graph2DRef} id="preview2d" class="graph-container"></div>
    {/if}
</div>

