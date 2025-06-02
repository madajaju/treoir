<script>
    export let defaultView;
    export let currentView;
    export let id;

    import {onMount,tick} from "svelte";
    import {graph} from "../stores/store.js"
    import {selectedNode, selectedNodeInfo, selectedClass, selectedClassList} from "../stores/store.js"
    import {getLayer} from "../stores/layerStore.js"
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
                let data = defaultView.default3DView();
                graphObj?.setData(data.nodes, data.links);
            }
        } else {
            if(node) {
                if (node._view?.hasOwnProperty('get2DView')) {
                    graph2D = 'Fetching the diagram';
                    let graph2DDiv = document.getElementById('preview2d');
                    node._view.get2DView(graph2DDiv, node, selectNode);
                } else {
                    graph2D = "Not Available!";
                }
            } else {
                graph2D = 'Fetching the diagram';
                let graph2DDiv = document.getElementById('preview2d');
                defaultView.default2DView(graph2DDiv, selectNode);
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
            totalMenu = [];
            for (let i in menu2DItems) {
                totalMenu.push(menu2DItems[i]);
            }
            if(node) {
                if (node._view?.hasOwnProperty('get2DView')) {
                    graph2D = 'Generating the diagram';
                    let graph2DDiv = document.getElementById('preview2d');
                    node._view.get2DView(graph2DDiv, node, selectNode, level);
                } else {
                    graph2D = "Not Available!";
                }
            } else {
                graph2D = 'Generating the diagram';
                let graph2DDiv = document.getElementById('preview2d');
                defaultView.default2DView(graph2DDiv, selectNode, level);
            }
        }
    }

    let totalMenu = [];
    const menu2DItems = [
        {
            label: '3D', action: () => {
                graphView = "3D";
            }
        },
        {
            label: '2D', action: () => {
                graphView = "2D";
            }
        },
        {
            label: '1 Levels', action: () => {
                updateGraphData($selectedNode, 1);
            }
        },
        {
            label: '2 Levels', action: () => {
                updateGraphData($selectedNode, 2);
            }
        },
        {
            label: '3 Levels', action: () => {
                updateGraphData($selectedNode, 3);
            }
        },
        {
            label: '4 Levels', action: () => {
                updateGraphData($selectedNode, 4);
            }
        },
    ];
    const menu3DItems = [
        {
            label: '2D', action: () => {
                graphView = "2D";
            }
        },
        {
            label: '1 Levels', action: () => {
                updateGraphData($selectedNode, 1);
            }
        },
        {
            label: '2 Levels', action: () => {
                updateGraphData($selectedNode, 2);
            }
        },
        {
            label: '3 Levels', action: () => {
                updateGraphData($selectedNode, 3);
            }
        },
        {
            label: '4 Levels', action: () => {
                updateGraphData($selectedNode, 4);
            }
        },
    ];


    function handleMenuClick(item) {
        // Handle menu click logic, e.g., navigation
        console.log('Selected Menu Item:', item);
    }
    function selectNode(node) {
        selectedNodeInfo.set(node);
    }
</script>
<!-- Container for the 3D Graph -->
<div class="parent-container">
    {#if totalMenu.length > 0}
        <Menu bind:menuItems={totalMenu} {handleMenuClick}></Menu>
    {/if}
    {#if graphView === '3D'}
        <div bind:this={graphRef} id="preview3d" class="graph-container"></div>
    {:else}
        <div bind:this={graph2DRef} id="preview2d" class="graph-container"></div>
    {/if}
</div>

<style>
    svg {
        width: 100%; /* Scales to the width of the container */
        height: 100%; /* Scales to the height of the container */
        max-width: 100%; /* Ensure it does not exceed container width */
        max-height: 100%; /* Ensure it does not exceed container height */
        object-fit: contain; /* Ensures the aspect ratio is preserved */
    }
    .graph-container {
        width: 100%;
        height: 100%;
        position: relative; /* This ensures proper layout handling */
    }
    #preview2d {
        width: 100%;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
    }

    /* Ensure the parent container also uses a size */
    .parent-container {
        height: 100%; /* 100% of the page viewport */
        overflow: hidden; /* Prevent unnecessary scrollbars */
    }

    .layer-group {
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
