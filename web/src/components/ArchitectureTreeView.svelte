<script>
    import { onMount } from "svelte";
    import { writable, derived } from "svelte/store";
    import TreeView from "./TreeView.svelte";
    import {fetchLayers, layerNodes} from "../stores/layerStore.js";

    // Example stores (you can replace this with your actual data logic)
    let topLevelNodesStore = writable([]);
    let childNodesStore = writable({}); // Object to store child nodes by parent ID
    export let nodes = [];

    $: nodes = $topLevelNodesStore;
    // Fetch top-level nodes
    async function fetchTopLevelNodes() {
        // Simulate fetching data
        await fetchLayers();
        const topNodes = $layerNodes;
        topLevelNodesStore.set(topNodes);
    }

    // Fetch child nodes for a specific node
    onMount(fetchTopLevelNodes);
</script>
<TreeView {nodes}  title="GEAR"/>