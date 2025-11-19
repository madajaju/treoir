<script lang="ts">
    import ArchitectureTreeView from './ArchitectureTreeView.svelte';
    import CustomerTreeView    from './CustomerTreeView.svelte';
    import PartnerTreeView from "./PartnerTreeView.svelte";
    import {selectedPartner} from "../stores/store";
    import ResizableLayout from "./ResizableLayout.svelte";

    // forward any props you need; here we assume only selectedNode
    export let selectedNode: any;
</script>

<style>
    .split {
        display: flex;
        flex-direction: column;
        height: 100%;    /* fill the full left‐panel height */
        background-color: #f5f5f5;
    }
    .half {
        flex: 1;         /* each child gets half */
        overflow: auto;  /* scroll if content overflows */
        border: 2px solid #ccc;
    }
</style>

<div class="split">
    <div class="half">
        <ArchitectureTreeView {selectedNode} />
    </div>
    <div class="half">
        <PartnerTreeView {selectedPartner} />
    </div>
</div>