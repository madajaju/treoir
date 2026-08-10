<script>
    import { onMount } from 'svelte';
    import GraphView from './GraphView.svelte';     // Your LayerGraph component

    export let verticalLayout = false; // false = horizontal, true = vertical layout

    let containerEl;
    let layerContainer;
    let relationshipContainer;

    export let layerView = null;
    export let relationshipView = null;

    // Expose selection forwarding / sync logic here if needed

</script>

<style>
    .both-container {
        display: flex;
        height: 100%;
        width: 100%;
        /* Vertical or horizontal layout decided by prop */
    }
    .horizontal {
        flex-direction: row;
    }
    .vertical {
        flex-direction: column;
    }
    .graph-pane {
        flex: 1;
        /* Add padding or margin to separate */
        padding: 0.5rem;
        overflow: hidden;
    }
</style>

<div bind:this={containerEl} class="both-graph-container" class:horizontal={!verticalLayout} class:vertical={verticalLayout}>
    <div bind:this={layerContainer} class="graph-box" aria-label="Layer Graph container">
        <GraphView id="Layer" currentView="{layerView}" defaultView="{layerView}" />
    </div>
    <div bind:this={relationshipContainer} class="graph-box" aria-label="Relationship Graph container">
        <GraphView id="Relationship" currentView="{relationshipView}" defaultView="{relationshipView}" />
    </div>
</div>