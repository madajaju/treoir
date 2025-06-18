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
    let layer = data.layer || "";

    // Bind associations with writable stores
    let partners = writable(Object.values(data.partners || {}));
    let layers = writable(Object.values(data.layers || {}));
    let assets = writable(Object.values(data.assets || {}));
    // Dialog states for managing nested forms
    let isLayerOpen = false;

    let formLayerProps = {data: {}};

    let isEditingLayer = false;

    // Handle saving the Element data
    function handleSave() {
        const updatedElement = {
            name,
            description,
            layer: $layer,
        };
        onSave(updatedElement);
    }

    // Handlers for managing Partners
    function openEditLayer(layer) {
        formLayerProps = {data: {...layer}};
        isLayerOpen = true;
    }

    function handleLayerSelect(layer) {
        layer = layer;
        isLayerOpen = false;
    }


    function handleDialogCancel() {
        isLayerOpen = false;
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
    <div class="form-section">
        <form on:submit|preventDefault={handleSave}>
            <!-- Name -->
            <div class="form-row">
                <label for="name">Name:</label>
                <input id="name" type="text" bind:value={name} placeholder="Enter name" required/>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label for="description">Description:</label>
                <textarea id="description" bind:value={description} placeholder="Enter description"></textarea>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label for="layer">Layer:</label>
                <input id="layer" type="text" bind:value={layer} placeholder="Layer"/>
            </div>

            <!-- Save Button -->
            <div>
                <button type="submit">Save Element</button>
            </div>
        </form>
    </div>

    <!-- Dialogs for nested form handling -->
    <div class="dialog-section">
        <Layer.Picker
                isOpen={isLayerOpen}
                onSelect={handleLayerSelect}
                onCancel={handleDialogCancel}
        />
    </div>
</div>