<script lang="ts">
    import ArchitectureTreeView from './ArchitectureTreeView.svelte';
    import PartnersTreeView from "./PartnersTreeView.svelte";

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
        <PartnersTreeView />
    </div>
</div>