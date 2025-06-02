<script>
    import { onMount } from "svelte";
    import { writable, derived } from "svelte/store";
    import TreeView from "./TreeView.svelte";
    import {fetchPartners, currentPartnerNodes} from "../stores/partnerStore.js";

    // Example stores (you can replace this with your actual data logic)
    let topLevelNodesStore = writable(null);
    let childNodesStore = writable({}); // Object to store child nodes by parent ID

    $: nodes = $topLevelNodesStore;
    // Fetch top-level nodes
    async function fetchTopLevelNodes() {
        // Simulate fetching data
        const topNodes = $currentPartnerNodes;

        topLevelNodesStore.set(topNodes);
    }

    // Fetch child nodes for a specific node
    onMount(fetchTopLevelNodes);
</script>

<TreeView {nodes} title="Partner" />