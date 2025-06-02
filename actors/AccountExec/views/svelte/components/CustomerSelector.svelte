<script>
    import {API_BASE_URL} from "../../../../../web/src/config.js";
    import {setCurrentCustomer, customers, fetchCustomers} from "../../../../../web/src/stores/customerStore.js"; // Assuming you have a store file where the customer is managed
    import {onMount} from 'svelte';

    let selectedFile = null;
    let newCustomerName = '';
    let newCustomerDescription = '';
    let selectedCustomerId = null;
    let customerList = [];

    onMount(() => {
        fetchCustomers();
        customers.subscribe(value => {
            console.log('Customers:', value);
            let junkArray = [];
            for(let i in value) {
                junkArray.push(value[i]);
            }
            customerList = junkArray;
        });
    });


    // Handle file input change
    function handleFileChange(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            selectedFile = files[0];
            console.log('File selected:', selectedFile); // Replace with actual logic
        }
    }

    // Mock function to upload the file
    async function uploadFile() {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        // Implement the file upload logic here
        // For example, you can use `fetch` to send the file to a server
        console.log('Uploading file:', selectedFile);

        // Example server request
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'Customer');
        const response = await fetch(`${API_BASE_URL}/customer/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }
        const data = await response.json();

        if (data._attributes.id) {
            await setCurrentCustomer(data._attributes.id);
        }
    }

    async function createNewCustomer() {
        if (!newCustomerName.trim()) {
            alert("Please enter a name for the new customer!");
            return;
        }
        console.log('Creating new customer:', newCustomerName);
        const formData = new FormData();
        formData.append('name', newCustomerName);
        formData.append('description', newCustomerDescription);
        const response = await fetch(`${API_BASE_URL}/customer/create?name=${newCustomerName}&description=${newCustomerDescription}`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (data._attributes.id) {
            await setCurrentCustomer(data._attributes.id);
        } else {
            console.error("No customer ID returned from the server.");
        }

        newCustomerName = '';
        newCustomerDescription = '';
    }

    async function selectCustomer() {
        await setCurrentCustomer(selectedCustomerId);
    }
</script>

<style>
    .uploader {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 400px;
        margin: auto;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background: #f9f9f9;
    }

    .uploader input {
        padding: 0.5rem;
    }

    .uploader button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background: #456789;
        color: white;
        border: none;
        border-radius: 4px;
    }

    .uploader button:hover {
        background: #0056b3;
    }

    .options-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* 3 columns */
        gap: 20px;
        padding: 20px;
    }

    .option {
        color: black;
        background: #fff;
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .option input,
    .option textarea,
    .option select {
        color: black;
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .option button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background: #456789;
        color: white;
        border: none;
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    .option button:hover {
        background: #0056b3;
    }

    /* Center titles */
    .option h3 {
        margin-bottom: 1rem;
    }
</style>

<div class="options-grid">
    <!-- Option 1: Create a New Customer -->
    <div class="option">
        <h3>Create a New Customer</h3>
        <input type="text" placeholder="Customer Name" bind:value={newCustomerName}/>
        <textarea placeholder="Customer Description" bind:value={newCustomerDescription}></textarea>
        <button on:click={createNewCustomer}>Create Customer</button>
    </div>

    <!-- Option 2: Load a Customer JSON File -->
    <div class="option">
        <h3>Load a Customer JSON File</h3>
        <input type="file" on:change={handleFileChange}/>
        <button on:click={uploadFile}>Upload</button>
    </div>

    <!-- Option 3: Select an Existing Customer -->
    <div class="option">
        <h3>Select an Existing Customer</h3>
        <select bind:value={selectedCustomerId}>
            <option value="" disabled selected>Select a Customer</option>
            {#each customerList as customer (customer.id)}
                <option value={customer.id}>{customer.name}</option>
            {/each}
        </select>
        <button on:click={selectCustomer}>Select Customer</button>
    </div>
</div>