<script>
    export let data = {};
    // Handlers for adding and removing suppliers dynamically
    function addSupplier() {
        const supplierName = prompt("Enter the supplier's name:");
        if (supplierName) {
            const supplierDescription = prompt("Enter the supplier's description:");
            const engagementsCount = prompt("Enter the number of engagements for the supplier:", "0");
            const key = crypto.randomUUID(); // Generate a unique ID for new suppliers
            data.suppliers[key] = {
                name: supplierName,
                description: supplierDescription || "",
                engagements: parseInt(engagementsCount) || 0
            };
        }
    }

    function removeSupplier(key) {
        delete data.suppliers[key]; // Remove the supplier by key
    }
</script>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: auto; /* Center the form horizontally */
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
    }

    .form-row {
        display: grid;
        grid-template-columns: 120px 1fr; /* Label width and input stretch */
        align-items: center; /* Vertically align items */
        gap: 1rem; /* Space between label and input */
    }

    label {
        font-weight: bold;
        text-align: right; /* Right-align labels */
    }

    input,
    textarea,
    select,
    button {
        font-size: 1rem;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%; /* Ensure inputs stretch inside their column */
    }

    textarea {
        resize: vertical; /* Allow vertical resizing for textarea */
    }

    .actions {
        display: flex;
        justify-content: flex-end; /* Align action buttons to the right */
        gap: 1rem; /* Space between buttons */
    }

    button {
        background-color: #007bff; /* Primary button color */
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
        padding: 0.5rem 1.5rem;
        font-weight: bold; /* Slightly more emphasis on buttons */
    }

    button:hover {
        background-color: #0056b3; /* Darker blue on hover */
    }

    /* Add Supplier button styling */
    .add-button {
        background-color: #28a745;
    }

    .add-button:hover {
        background-color: #218838;
    }

    /* Remove Supplier button */
    .remove-button {
        background-color: #dc3545;
    }

    .remove-button:hover {
        background-color: #a71d2a;
    }
</style>

<form>
    <!-- Name -->
    <div class="form-row">
        <label for="name">Name:</label>
        <input id="name" type="text" placeholder="Enter name" bind:value={data.name} required />
    </div>

    <!-- Description -->
    <div class="form-row">
        <label for="description">Description:</label>
        <textarea id="description" bind:value={data.description} rows="3" placeholder="Enter description"></textarea>
    </div>

    <!-- Color -->
    <div class="form-row">
        <label for="color">Color:</label>
        <input id="color" type="color" bind:value={data.color} />
    </div>

    <!-- Target Date -->
    <div class="form-row">
        <label for="targetDate">Target Date:</label>
        <input id="targetDate" type="date" bind:value={data.targetDate} required />
    </div>

    <!-- KPIs -->
    <div class="form-row">
        <label for="kpis">KPIs:</label>
        <input id="kpis" type="text" bind:value={data.kpis} placeholder="Enter KPIs (e.g., goals)" />
    </div>

    <!-- Suppliers Section -->
    <div>
        <label>Suppliers:</label>
        <ul class="supplier-list">
            {#if data.suppliers }
            {#each Object.entries(data.suppliers) as [key, supplier]}
                <li>
                    <div class="form-row">
                        <input
                            type="text"
                            bind:value={supplier.name}
                            placeholder="Supplier name"
                            required
                        />
                        <input
                            type="text"
                            bind:value={supplier.description}
                            placeholder="Supplier description"
                        />
                        <input
                            type="number"
                            bind:value={supplier.engagements}
                            placeholder="Engagements"
                        />
                    </div>
                    <button
                        type="button"
                        class="remove-button"
                        on:click={() => removeSupplier(key)}
                    >
                        Remove
                    </button>
                </li>
            {/each}
            {/if}
        </ul>
        <button type="button" class="add-button" on:click={addSupplier}>+ Add Supplier</button>
    </div>
</form>