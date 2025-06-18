<script>
    export let data = {};
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
        <label for="color">URL:</label>
        <input id="color" type="text" bind:value={data.url} />
    </div>
</form>