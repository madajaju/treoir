<script>
    import Dialog from "../../Dialog.svelte"; // Reusable Dialog component for nested forms.
    import {writable} from "svelte/store";
    import {Layer} from "../../elements/Layer";
    import {Asset} from "../../elements/Asset";
    import {Partner} from "../../elements/Partner";

    export let data; // The Element data object being edited.
    export let onSave = () => {
    };

    // Bind attributes with writable stores
    let name = data.name || "";
    let description = data.description || "";
    let color = data.color || "#00ff00"; // Default color if not provided

    // Bind associations with writable stores
    let partners = writable(Object.values(data.partners || {}));
    let layers = writable(Object.values(data.layers || {}));
    let assets = writable(Object.values(data.assets || {}));
    // Dialog states for managing nested forms
    let isPartnerOpen = false;
    let isLayerOpen = false;
    let isAssetOpen = false;

    let formPartnerProps = {data: {}};
    let formLayerProps = {data: {}};
    let formAssetProps = {data: {}};

    let isEditingPartner = false;
    let isEditingLayer = false;
    let isEditingAsset = false;

    // Handle saving the Element data
    function handleSave() {
        const updatedElement = {
            name,
            description,
            color,
            partners: $partners,
            layers: $layers,
            assets: $assets,
        };
        onSave(updatedElement);
    }

    // Handlers for managing Partners
    function handleAddPartner() {
        formPartnerProps = {data: {name: "", description: ""}};
        isEditingPartner = false;
        isPartnerOpen = true;
    }

    function openEditPartner(partner) {
        formPartnerProps = {data: {...partner}};
        isEditingPartner = true;
        isPartnerOpen = true;
    }

    function handlePartnerSubmit(partner) {
        if (isEditingPartner) {
            const index = $partners.findIndex((p) => p.id === partner.id);
            if (index !== -1) {
                $partners[index] = {...partner};
            }
        } else {
            $partners = [...$partners, partner];
        }
        isPartnerOpen = false;
    }

    // Handlers for managing Layers

    function openEditLayer(layer) {
        formLayerProps = {data: {...layer}};
        isEditingLayer = true;
        isLayerOpen = true;
    }

    function handleLayerSubmit(layer) {
        if (isEditingLayer) {
            const index = $layers.findIndex((l) => l.id === layer.id);
            if (index !== -1) {
                $layers[index] = {...layer};
            }
        } else {
            $layers = [...$layers, layer];
        }
        isLayerOpen = false;
    }

    // Handlers for managing Assets
    function handleAddAsset() {
        formAssetProps = {data: {name: "", description: "", url: ""}};
        isEditingAsset = false;
        isAssetOpen = true;
    }

    function openEditAsset(asset) {
        formAssetProps = {data: {...asset}};
        isEditingAsset = true;
        isAssetOpen = true;
    }

    function handleAssetSubmit(asset) {
        if (isEditingAsset) {
            const index = $assets.findIndex((a) => a.id === asset.id);
            if (index !== -1) {
                $assets[index] = {...asset};
            }
        } else {
            $assets = [...$assets, asset];
        }
        isAssetOpen = false;
    }

    function handleDialogCancel(dialogType) {
        if (dialogType === "partner") isPartnerOpen = false;
        if (dialogType === "layer") isLayerOpen = false;
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
                <input id="name" type="text" bind:value={name} placeholder="Enter element name" required/>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label for="description">Description:</label>
                <textarea id="description" bind:value={description} placeholder="Enter element description"></textarea>
            </div>

            <!-- Color -->
            <div class="form-row">
                <label for="color">Color:</label>
                <input id="color" type="color" bind:value={color}/>
            </div>

            <!-- Partners -->
            <div>
                <label>Partners:</label>
                <table>
                    <tbody>
                    {#each $partners as partner}
                        <tr on:click={() => openEditPartner(partner)}>
                            <td>{partner.name}</td>
                            <td>{partner.description}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" class="addButton" on:click={handleAddPartner}>Add Partner</button>
            </div>

            <!-- Layers -->
            <div>
                <label>Layers:</label>
                <table>
                    <tbody>
                    {#each $layers as layer}
                        <tr on:click={() => openEditLayer(layer)}>
                            <td>{layer}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>

            <!-- Assets -->
            <div>
                <label>Assets:</label>
                <table>
                    <tbody>
                    {#each $assets as asset}
                        <tr on:click={() => openEditAsset(asset)}>
                            <td>{asset.name}</td>
                            <td>{asset.description}</td>
                            <td>{asset.url}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" class="addButton" on:click={handleAddAsset}>Add Asset</button>
            </div>

            <!-- Save Button -->
            <div>
                <button type="submit">Save Element</button>
            </div>
        </form>
    </div>

    <!-- Dialogs for nested form handling -->
    <div class="dialog-section">
        <Dialog
                bind:isOpen={isPartnerOpen}
                title={isEditingPartner ? "Edit Partner" : "Add Partner"}
                formComponent={Partner.Form}
                formProps={formPartnerProps}
                on:submit={handlePartnerSubmit}
                on:cancel={() => handleDialogCancel("partner")}
        />

        <Dialog
                bind:isOpen={isAssetOpen}
                title={isEditingAsset ? "Edit Asset" : "Add Asset"}
                formComponent={Asset.Form}
                formProps={formAssetProps}
                on:submit={handleAssetSubmit}
                on:cancel={() => handleDialogCancel("layer")}
        />

        <Dialog
                bind:isOpen={isLayerOpen}
                title={isEditingLayer ? "Edit Layer" : "Add Layer"}
                formComponent={Layer.Picker}
                formProps={formLayerProps}
                on:submit={handleLayerSubmit}
                on:cancel={() => handleDialogCancel("layer")}
        />
    </div>
</div>