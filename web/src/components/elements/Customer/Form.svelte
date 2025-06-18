<script>
    import {API_BASE_URL} from "../../../config.js";
    import {writable} from "svelte/store";
    import Dialog from "../../Dialog.svelte";
    import {Phase} from "../Phase/index.js";
    import {Asset} from "../Asset/index.js";
    import {fetchCurrentCustomer} from "../../../stores/customerStore.js";

    // Props - customer and handlers
    export let data;
    export let onSave = () => {
    };
    export let onAddAsset = () => {
    };

    let customer = data; // Customer object to update

    // Writable stores for customer properties
    let name = customer.name || "";
    let color = customer.color || "#00ff00"; // Default color
    let assets = Object.values(customer.assets || {});
    let phases = Object.values(customer.phases || {});

    // Dialog state
    let isPhaseOpen = false;
    let formProps = {data: {}}; // Stores the data passed to the form
    let isEditingPhase = false; // Flag to differentiate between adding and editing
    let isAssetOpen = false;
    let formAssetProps = {data: {}}; // Stores the data passed to the form
    let isEditingAsset = false; // Flag to differentiate between adding and editing
    // Handlers
    function handleSave() {
        const updatedCustomer = {
            name,
            color,
            assets,
            phases,
        };
        onSave(updatedCustomer);
    }

    function handleAddAsset(asset) {
        formAssetProps = {data: {name: "", description: "", url: ""} };
        isEditingAsset = false; // Set flag to adding mode
        isAssetOpen = true; // Open the dialog
    }

    function openEditAsset(asset) {
        formAssetProps = {data: {...asset}}; // Populate with existing phase data
        isEditingAsset = true; // Set flag to editing mode
        isAssetOpen = true; // Open the dialog
    }

    function openEditPhase(phase) {
        formProps = {data: {...phase}}; // Populate with existing phase data
        isEditingPhase = true; // Set flag to editing mode
        isPhaseOpen = true; // Open the dialog
    }

    function handleAddPhase() {
        formProps = {data: {name: "", description: "", color: "#ffffff", targetDate: "", kpis: ""}}; // Empty data for a new phase
        isEditingPhase = false; // Set flag to adding mode
        isPhaseOpen = true; // Open the dialog
    }

    async function handleAssetSubmit(asset) {
        if (isEditingAsset) {
            // If editing, update the existing asset
            const index = assets.findIndex((p) => p.id === asset.id);
            if (index !== -1) {
                assets[index] = {...asset}; // Update in-place
            }
        } else {
            // If adding, create a new phase
            const url = `asset/create?type="Customer"&owner=${customer.id}`;
            const res = await fetch(`/api/${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(asset),
            });

            if (!res.ok)
                throw new Error(
                    `Failed to add asset: ${res.status} ${res.statusText}`
                );

            // Add the new asset to the list
            assets = [...assets, asset];
        }

        // Fetch current customer to update asset list
        fetchCurrentCustomer();
        isAssetOpen = false; // Close the dialog
    }

    async function handlePhaseSubmit(phase) {
        if (isEditingPhase) {
            // If editing, update the existing phase
            const index = phases.findIndex((p) => p.id === phase.id);
            if (index !== -1) {
                phases[index] = {...phase}; // Update in-place
            }
        } else {
            // If adding, create a new phase
            const url = `phase/create?customer=${customer.id}`;
            const res = await fetch(`/api/${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(phase),
            });

            if (!res.ok)
                throw new Error(
                    `Failed to add phase: ${res.status} ${res.statusText}`
                );

            // Add the new phase to the list
            phases = [...phases, phase];
        }

        // Fetch current customer to update phase list
        fetchCurrentCustomer();
        isPhaseOpen = false; // Close the dialog
    }

    function handlePhaseCancel() {
        isPhaseOpen = false; // Simply close the dialog
    }
    function handleAssetCancel() {
        isAssetOpen = false; // Simply close the dialog
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
                <input id="name" type="text" bind:value={name} placeholder="Enter customer name" required/>
            </div>

            <!-- Color -->
            <div class="form-row">
                <label for="color">Color:</label>
                <input id="color" type="color" bind:value={color}/>
            </div>

            <!-- Assets Section -->
            <div class="assets">
                <label>Assets:</label>
                <table class="association-table">
                   <tbody>
                   {#each assets as asset}
                       <tr on:click={() => openEditAsset(asset)}>
                           <td> {asset.name || "Unnamed Asset"} </td>
                           <td> {asset.description || "TBD"} </td>
                           <td> {asset.url || "TBD"} </td>
                       </tr>
                   {/each}
                   </tbody>
                </table>
                <button type="button" class="addItem" on:click={handleAddAsset}>
                    Add Asset
                </button>
            </div>

            <!-- Phases Section -->
            <div class="phases">
                <label>Phases:</label>
                <table class="association-table">
                    <tbody>
                    {#each phases as phase}
                    <tr on:click={() => openEditPhase(phase)}>
                        <td style="display: inline-block; width: 1em; height: 1em; background-color: {phase.color || '#ffff00'}; margin-right: 0.5em;" ></td>
                        <td>{phase.name}</td>
                        <td>{phase.description}</td>
                        <td>{Object.values(phase.suppliers).length}</td>
                    </tr>
                    {/each}
                    </tbody>
                </table>
                <button type="button" class="addItem" on:click={handleAddPhase}>
                    Add Phase
                </button>
            </div>
        </form>
    </div>

    <!-- Dialog for Adding/Editing Phase -->
    <div class="dialog-section">
        <Dialog
                bind:isOpen={isPhaseOpen}
                formComponent={Phase.Form}
                title={isEditingPhase ? "Edit Phase" : "Add Phase"}
                formProps={formProps}
                onSubmit={handlePhaseSubmit}
                onCancel={handlePhaseCancel}
        />
        <Dialog
                bind:isOpen={isAssetOpen}
                formComponent={Asset.Form}
                title={isEditingAsset ? "Edit Asset" : "Add Asset"}
                formProps={formAssetProps}
                onSubmit={handleAssetSubmit}
                onCancel={handleAssetCancel}
        />
    </div>
</div>