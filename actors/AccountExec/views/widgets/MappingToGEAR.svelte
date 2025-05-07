<script>
    export let mapData = {}; // Input: Customer GEAR map
    export let editable = false; // Input: Whether edit mode is enabled
    export let onSave; // Callback for saving updated map data

    let localMapData = { ...mapData }; // Maintain a local copy for edits
</script>

<div class="mapping-to-gear">
    <h2>Mapping to GEAR</h2>

    <!-- Render map data as JSON-like view for now (can make it interactive) -->
    <div class="map-display">
        <pre>{JSON.stringify(localMapData, null, 2)}</pre>
    </div>

    {#if editable}
        <button on:click={() => onSave(localMapData)}>Save Mapping</button>
    {/if}
</div>

<style>
    .mapping-to-gear {
        border: 1px solid lightgray;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 0.5rem;
    }
    .map-display {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: 0.5rem;
    }
</style>