<script>
    import TreeView from "../components/TreeView.svelte";
    import { partnerNodes, fetchPartners } from "../stores/partnerStore.js";
    import { onMount } from "svelte";

    // Fetch partners when this component is mounted
    onMount(fetchPartners);
</script>

<main>
    <TreeView title="Partners" nodes={$partnerNodes} />
</main>