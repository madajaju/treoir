<script>
    import Dialog from "../../Dialog.svelte"; // Assuming Dialog is a reusable component for managing nested data entry.
    import {writable} from "svelte/store";
    import {Element} from "../Element/index.js";
    import {Asset} from "../Asset/index.js";

    export let data; // The Partner data being edited.
    export let onSave = () => {
    };

    // Writable stores to bind form fields and associations
    let name = data.name || "";
    let description = data.description || "";
    let color = data.color || "#00ff00"; // Default color if not provided

    let elements = writable(Object.values(data.elements || {}));
    let regions = writable(Object.values(data.regions || {}));
    let suggestions = writable(Object.values(data.suggestions || {}));
    let assets = writable(Object.values(data.assets || {}));

    // Dialog state for managing nested forms
    let isElementOpen = false;
    let isRegionOpen = false;
    let isSuggestionOpen = false;
    let isAssetOpen = false;

    let formElementProps = {data: {}};
    let formRegionProps = {data: {}};
    let formSuggestionProps = {data: {}};
    let formAssetProps = {data: {}};

    let isEditingElement = false;
    let isEditingRegion = false;
    let isEditingSuggestion = false;
    let isEditingAsset = false;

    // Save the Partner data
    function handleSave() {
        const updatedPartner = {
            name,
            description,
            color,
            elements: $elements,
            regions: $regions,
            suggestions: $suggestions,
            assets: $assets,
        };
        onSave(updatedPartner);
    }

    // Handlers for adding or editing associated elements
    function handleAddElement() {
        formElementProps = {data: {name: "", description: ""}};
        isEditingElement = false;
        isElementOpen = true;
    }

    function openEditElement(element) {
        formElementProps = {data: {...element}};
        isEditingElement = true;
        isElementOpen = true;
    }

    function handleElementSubmit(element) {
        if (isEditingElement) {
            const index = $elements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
                $elements[index] = {...element};
            }
        } else {
            $elements = [...$elements, element];
        }
        isElementOpen = false;
    }

    // Handlers for adding or editing assets
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
            const index = $assets.findIndex((as) => as.id === asset.id);
            if (index !== -1) {
                $assets[index] = {...asset};
            }
        } else {
            $assets = [...$assets, asset];
        }
        isAssetOpen = false;
    }

    // Additional handlers (regions, suggestions) can be added here following the same pattern.

    function handleDialogCancel(dialogType) {
        if (dialogType === "element") isElementOpen = false;
        if (dialogType === "asset") isAssetOpen = false;
        if (dialogType === "region") isRegionOpen = false;
        if (dialogType === "suggestion") isSuggestionOpen = false;
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
    .hover-highlight:hover {
        background-color: #123456;
        color: white;
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
                <input id="name" type="text" bind:value={name} placeholder="Enter partner name" required/>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label for="description">Description:</label>
                <textarea id="description" bind:value={description} placeholder="Enter partner description"></textarea>
            </div>

            <!-- Color -->
            <div class="form-row">
                <label for="color">Color:</label>
                <input id="color" type="color" bind:value={color}/>
            </div>

            <!-- Elements -->
            <div>
                <label>Elements:</label>
                <table class="association-table">
                    <tbody>
                    {#each $elements as element}
                        <tr on:click={() => openEditElement(element)}>
                            <td>{element.name}</td>
                            <td>{element.description}</td>
                            <td>
                                {#each element.layers as layer}
                                    <span title="{layer}" style="cursor: pointer;" class:hover-highlight={true} on:mouseenter>
                                        {layer.split('-').slice(-1)}
                                    </span>
                                    <br>
                                {/each}
                        </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" on:click={handleAddElement}>Add Element</button>
            </div>

            <!-- Assets -->
            <div>
                <label>Assets:</label>
                <table class="association-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>URL</th>
                    </tr>
                    </thead>
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
                <button type="button" on:click={handleAddAsset}>Add Asset</button>
            </div>

            <!-- Save Button -->
            <div>
                <button type="submit">Save Partner</button>
            </div>
        </form>
    </div>

    <!-- Dialogs for nested form handling -->
    <div class="dialog-section">
        <Dialog
                bind:isOpen={isElementOpen}
                title={isEditingElement ? "Edit Element" : "Add Element"}
                formComponent={Element.Form}
                formProps={formElementProps}
                on:submit={handleElementSubmit}
                on:cancel={() => handleDialogCancel("element")}
        />

        <Dialog
                bind:isOpen={isAssetOpen}
                title={isEditingAsset ? "Edit Asset" : "Add Asset"}
                formComponent={Asset.Form}
                formProps={formAssetProps}
                on:submit={handleAssetSubmit}
                on:cancel={() => handleDialogCancel("asset")}
        />
    </div>
</div>