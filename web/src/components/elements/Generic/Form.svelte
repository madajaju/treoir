<script>
    import {Generic} from "../Generic/index.js";
    import Dialog from "../../Dialog.svelte";

    export let schema = {}; // Schema describing the object
    export let data = {}; // The data object to bind to

    let isEditing = {};
    let isDialogOpen = {};
    let formProps = {};
    let formComponent = {};

    function handleAdd(key) {
        isDialogOpen[key] = true;
        isEditing[key] = false;
        formProps[key] = {data: {}, schema: {...schema}};
        console.log(key);
    }

    function openEdit(key, value) {
        isDialogOpen[key] = true;
        isEditing[key] = true;
        formProps[key] = {data: {...value}, schema: {...schema}};
        console.log(key, value);
    }
    function handleCancel(key) {
        isDialogOpen[key] = false;
        isEditing[key] = false;
    }
    function handleSubmit(key, data) {
        console.log(key, data);
        isDialogOpen[key] = false;
        isEditing[key] = false;
    }
</script>
<div class="layout-container">
    <div class="form-section">
        <form>
            {#each Object.entries(schema.attributes) as [key, field]}
                <div class="form-row" key={key}>
                    {#if field.type === 'string'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="text" bind:value={data[key]} required={field.required || false}/>
                    {/if}

                    {#if field.type === 'number'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="number" bind:value={data[key]}/>
                    {/if}

                    {#if field.type === 'color'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="color" bind:value={data[key]}/>
                    {/if}

                    {#if field.type === 'date'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="date" bind:value={data[key]}/>
                    {/if}

                    {#if field.type === 'text'}
                        <label for={key}>{field.label || key}</label>
                        <textarea id={key} bind:value={data[key]}></textarea>
                    {/if}
                    {#if field.type === 'boolean'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="checkbox" bind:checked={data[key]}/>
                    {/if}
                    {#if field.type === 'file'}
                        <label for={key}>{field.label || key}</label>
                        <input id={key} type="file" bind:value={data[key]}/>
                    {/if}
                    {#if field.type === 'json'}
                        <label for={key}>{field.label || key}</label>
                        <textarea id={key} bind:value={data[key]}></textarea>
                    {/if}
                </div>
            {/each}
            {#if schema.associations}
            {#each Object.entries(schema.associations) as [key, field]}
                {#if field.cardinality === '1'}
                    <label for={key}>{field.label || key}</label>
                    <span>{data[key]}</span>
                {:else}
                    <table class="association-table">
                        {#if data[key]}
                            {#each Object.entries(data[key]) as [key2, value2]}
                                <tr on:click={() => openEdit(key, value2)}>
                                    <td>{key2}</td>
                                    <td>{value2.name}</td>
                                    <td>{value2.description}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr><td>Add and Item</td></tr>
                        {/if}
                    </table>
                    <button type="button" class="addItem" on:click={ () => handleAdd(key)}>
                        Add {field.label || key}
                    </button>
                {/if}
            {/each}
            {/if}
        </form>
    </div>
    <div class="dialog-section">
        {#if schema.associations}
        {#each Object.entries(schema.associations) as [key, field]}
        <Dialog
                bind:isOpen={isDialogOpen[key]}
                formComponent={Generic.Form}
                title={isEditing[key] ? "Edit {key}" : "Add Phase"}
                formProps={formProps}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
        />
        {/each}
        {/if}
    </div>
</div>

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