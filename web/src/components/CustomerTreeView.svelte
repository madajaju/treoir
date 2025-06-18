<script>
    import { onMount } from "svelte";
    import { writable, derived } from "svelte/store";
    import TreeView from "./TreeView.svelte";
    import {fetchCurrentCustomer, currentCustomerNodes} from "../stores/customerStore.js";

    // Example stores (you can replace this with your actual data logic)
    let topLevelNodesStore = derived(currentCustomerNodes, ($currentCustomerNodes) => $currentCustomerNodes);

    $: nodes = $topLevelNodesStore;

    // Fetch child nodes for a specific node
    onMount(fetchCurrentCustomer);
</script>
<TreeView {nodes} title="Customer"/>