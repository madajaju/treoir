<script>
    import {layerNodes} from "../../../stores/layerStore.js";
    export let onSelect = (selectedLayer) => {}; // Callback triggered when a layer is selected
    export let isOpen = false; // Controls whether the LayerPicker is visible
    export let onCancel = () => {}; // Callback when the picker is closed without selection
    export let data = "";
    // Handle user selection of a layer
    console.log($layerNodes);
    function selectLayer(layer) {
        onSelect(layer);
        closePicker();
    }

    // Close the LayerPicker
    function closePicker() {
        onCancel();
    }

    // Recursive helper to render layers with sublayers
    function renderLayers(layerList) {
        return layerList.map(layer => ({
            name: layer.name,
            description: layer.description,
            color: layer.color,
            layers: layer.layers || [], // Make sure sublayers exist
        }));
    }
</script>

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .picker {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header {
        font-weight: bold;
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }

    .layer {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.8rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    .layer:hover {
        background-color: #f5f5f5;
        cursor: pointer;
    }

    .name {
        font-weight: bold;
        margin-bottom: 0.3rem;
    }

    .description {
        font-size: 0.9rem;
        color: #555;
    }

    .sublayers {
        margin-left: 1.5rem;
        margin-top: 0.5rem;
        border-left: 2px solid #ddd;
        padding-left: 0.5rem;
    }

    .close-button {
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem;
        font-size: 0.8rem;
        margin-top: 1rem;
        cursor: pointer;
    }

    .close-button:hover {
        background-color: #d32f2f;
    }
</style>

{#if isOpen}
    <div class="modal">
        <h1>HereThere</h1>
        <div class="picker">
            <div class="header">Select a Layer</div>
            <!-- Render the layers recursively -->
            {#each renderLayers($layerNodes) as layer}
                <h1>Here</h1>
                <div class="layer" on:click={() => selectLayer(layer)}>
                    <div class="name" style="color: {layer.color}">
                        {layer.name}
                    </div>
                    <!-- Render sublayers if any -->
                    {#if layer.layers.length > 0}
                        <div class="sublayers">
                            {#each layer.layers as sublayer}
                                <div class="layer" on:click={() => selectLayer(sublayer)}>
                                    <div class="name" style="color: {sublayer.color}">
                                        {sublayer.name}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}

            <!-- Cancel/Close Button -->
            <button class="close-button" on:click={closePicker}>Cancel</button>
        </div>
    </div>
{/if}