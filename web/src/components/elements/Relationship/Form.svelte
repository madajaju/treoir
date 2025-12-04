<script>

    import Dialog from "../../Dialog.svelte"; // Assuming you have a reusable Dialog component for sub-layer, element, and asset management.
    import {Layer} from "../Layer/index.js";
    import {Asset} from "../Asset/index.js";

    export let data; // The Layer data object being edited
    export let onSave = () => {
    };
    export let onAddSubLayer = () => {
    };
    export let onAddAsset = () => {
    };

    let layer = data;
    // Writable data directly bound to the form fields
    let name = layer.name || "";
    let description = layer.description || "";
    let position = layer.position;
    let color = layer.color || "#00ffff";
    let orientation = layer.orientation || "";

    let subLayers = Object.values(layer.layers || {});
    let elements = Object.values(layer.elements || {});
    let assets = Object.values(layer.assets || {});

    // Dialog state for managing nested components
    let isSubLayerOpen = false;
    let subLayerFormProps = {element: {}};
    let isEditingSubLayer = false;

    let isAssetOpen = false;
    let assetFormProps = {data: {}};
    let isEditingAsset = false;

    function handleSave() {
        const updatedLayer = {
            name,
            description,
            position: position,
            color,
            orientation,
            layers: subLayers,
            elements,
            assets,
        };
        onSave(updatedLayer);
    }

    function handleAddSubLayer() {
        subLayerFormProps = {data: {name: "", description: "", position: {}, color: "#ffffff", orientation: ""}};
        isEditingSubLayer = false;
        isSubLayerOpen = true;
    }

    function openEditSubLayer(subLayer) {
        subLayerFormProps = {data: {...subLayer}};
        isEditingSubLayer = true;
        isSubLayerOpen = true;
    }

    function handleAddAsset() {
        assetFormProps = {data: {name: "", description: "", url: ""}};
        isEditingAsset = false;
        isAssetOpen = true;
    }

    function openEditAsset(asset) {
        assetFormProps = {data: {...asset}};
        isEditingAsset = true;
        isAssetOpen = true;
    }

    function handleSubLayerSubmit(subLayer) {
        if (isEditingSubLayer) {
            const index = subLayers.findIndex((layer) => layer.id === subLayer.id);
            if (index !== -1) {
                subLayers[index] = {...subLayer};
            }
        } else {
            subLayers = [...subLayers, subLayer];
        }
        isSubLayerOpen = false;
    }

    function handleElementSubmit(element) {
        if (isEditingElement) {
            const index = elements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
                elements[index] = {...element};
            }
        } else {
            elements = [...elements, element];
        }
        isElementOpen = false;
    }

    function handleAssetSubmit(asset) {
        if (isEditingAsset) {
            const index = assets.findIndex((as) => as.id === asset.id);
            if (index !== -1) {
                assets[index] = {...asset};
            }
        } else {
            assets = [...assets, asset];
        }
        isAssetOpen = false;
    }

    function handleDialogCancel(dialogType) {
        if (dialogType === "subLayer") isSubLayerOpen = false;
        if (dialogType === "asset") isAssetOpen = false;
    }
</script>

<style>
    .layout-container {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: flex-start; /* Align the dialog and form at the top */
        width: 100%;
        padding: 1rem;
    }

    /* Left-side Form Section */
    .form-section {
        flex: 1; /* Take up available space */
        max-width: 50%; /* Adjust form width as needed */
    }

    /* Right-side Dialog Section */
    .dialog-section {
        flex: 1; /* Take up available space */
        max-width: 50%; /* Adjust dialog width as needed */
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: auto; /* Center horizontally */
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
    }

    .form-row {
        display: grid;
        grid-template-columns: 150px 1fr; /* Fixed label + flexible input */
        align-items: center;
        gap: 1rem;
    }

    label {
        font-weight: bold;
        text-align: right; /* Align all labels on the right */
    }

    input,
    select,
    textarea,
    button {
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%; /* Ensure all inputs stretch properly */
    }

    textarea {
        resize: vertical; /* Allow vertical resizing for text areas */
    }

    .assets,
    .phases {
        margin-top: 1rem;
    }

    ul {
        list-style: inside disc;
        padding: 0;
        margin: 0;
    }

    /* Button Styling */
    button {
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: bold;
    }

    button:hover {
        background-color: #0056b3;
    }

    .association-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-top: 1rem;
        margin-bottom: 1rem;
        font-size: 0.8rem;
        text-align: left;
        vertical-align: top;
    }
    .association-table tr:hover {
        background-color: #85ffff;
        cursor: pointer;
    }
    .association-table td {
        vertical-align: top;
    }
    .addItem {
        background-color: #cff4fc;
        color: #055160;
    }

    .addItem:hover {
        background-color: #b6ebf3;
    }

    .resetButton {
        background-color: #f8d7da;
        color: #842029;
    }

    .resetButton:hover {
        background-color: #f5c2c7;
    }
</style>
<div class="layout-container">
    <div class="form-section">
        <form on:submit|preventDefault={handleSave}>
            <!-- Name -->
            <div class="form-row">
                <label for="name">Name:</label>
                <input id="name" type="text" bind:value={name} placeholder="Enter layer name" required/>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label for="description">Description:</label>
                <textarea id="description" bind:value={description} placeholder="Enter layer description"></textarea>
            </div>

            <!-- Position inputs -->
            <div class="form-row">
                <label>Position:</label>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                    <input
                            id="row"
                            type="number"
                            bind:value={position.row}
                            placeholder="Row"
                            min="1"
                            title="Row Position"
                    />
                    <input
                            id="col"
                            type="number"
                            bind:value={position.col}
                            placeholder="Col"
                            min="1"
                            title="Column Position"
                    />
                    <input
                            id="colspan"
                            type="number"
                            bind:value={position.colspan}
                            placeholder="Colspan"
                            min="1"
                            title="Column Span"
                    />
                    <input
                            id="rowspan"
                            type="number"
                            bind:value={position.rowspan}
                            placeholder="Rowspan"
                            min="1"
                            title="Row Span"
                    />
                </div>
            </div>

            <!-- Color -->
            <div class="form-row">
                <label for="color">Color:</label>
                <input id="color" type="color" bind:value={color}/>
            </div>

            <!-- Orientation -->
            <div class="form-row">
                <label for="orientation">Orientation:</label>
                <input id="orientation" type="text" bind:value={orientation} placeholder="top, bottom, left..."/>
            </div>

            <!-- Sublayers -->
            <div>
                <label>SubLayers:</label>
                <table class="association-table">
                    <tbody>
                    {#each subLayers as subLayer}
                        <tr on:click={() => openEditSubLayer(subLayer)}>
                            <td>{subLayer.name}</td>
                            <td>{subLayer.description}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" class="addItem" on:click={handleAddSubLayer}>Add SubLayer</button>
            </div>

            <!-- Elements -->
            <div>
                <label>Elements:</label>
                <table class="association-table">
                    <tbody>
                    {#each elements as element}
                        <tr>
                            <td>{element.name}</td>
                            <td>{element.description}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>

            <!-- Assets -->
            <div>
                <label>Assets:</label>
                <table class="association-table">
                    <tbody>
                    {#each assets as asset}
                        <tr on:click={() => openEditAsset(asset)}>
                            <td>{asset.name}</td>
                            <td>{asset.description}</td>
                            <td>{asset.url}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" class="addItem" on:click={handleAddAsset}>Add Asset</button>
            </div>

            <!-- Save Button -->
            <div class="actions">
                <button type="submit">Save Layer</button>
            </div>
        </form>
    </div>
    <div class="dialog-section">

        <!-- Dialog components for adding/editing sublayers, elements, and assets -->
        <Dialog
                bind:isOpen={isSubLayerOpen}
                title={isEditingSubLayer ? "Edit SubLayer" : "Add SubLayer"}
                formComponent={Layer.Form}
                formProps={subLayerFormProps}
                on:submit={handleSubLayerSubmit}
                on:cancel={() => handleDialogCancel("subLayer")}
        />

        <Dialog
                bind:isOpen={isAssetOpen}
                title={isEditingAsset ? "Edit Asset" : "Add Asset"}
                formComponent={Asset.Form}
                formProps={assetFormProps}
                on:submit={handleAssetSubmit}
                on:cancel={() => handleDialogCancel("asset")}
        />
    </div>
</div>