<script>
    import {setCurrentPartner, partners, fetchPartners} from "../../../../../web/src/stores/partnerStore.js"; // Assuming you have a store file where the partner is managed
    import {onMount} from 'svelte';

    let selectedFile = null;
    let newPartnerName = '';
    let newPartnerDescription = '';
    let selectedPartnerId = null;
    let partnerList = [];

    onMount(() => {
        fetchPartners();
        partners.subscribe(value => {
            let junkArray = [];
            for(let i in value) {
                junkArray.push(value[i]);
            }
            partnerList = junkArray;
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
        formData.append('type', 'Partner');
        const response = await fetch(`/api/partner/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }
        const data = await response.json();

        if (data._attributes.id) {
            await setCurrentPartner(data._attributes.id);
        }
    }

    async function createNewPartner() {
        if (!newPartnerName.trim()) {
            alert("Please enter a name for the new partner!");
            return;
        }
        console.log('Creating new partner:', newPartnerName);
        const formData = new FormData();
        formData.append('name', newPartnerName);
        formData.append('description', newPartnerDescription);
        const response = await fetch(`/api/partner/create?name=${newPartnerName}&description=${newPartnerDescription}`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (data._attributes.id) {
            await setCurrentPartner(data._attributes.id);
        } else {
            console.error("No partner ID returned from the server.");
        }

        newPartnerName = '';
        newPartnerDescription = '';
    }

    async function selectPartner() {
        await setCurrentPartner(selectedPartnerId);
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
        background: #007bff;
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
        color: #000;
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
        color: #000;
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .option button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background: #007bff;
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
    <!-- Option 1: Create a New Partner -->
    <div class="option">
        <h3>Create a New Partner</h3>
        <input type="text" placeholder="Partner Name" bind:value={newPartnerName}/>
        <textarea placeholder="Partner Description" bind:value={newPartnerDescription}></textarea>
        <button on:click={createNewPartner}>Create Partner</button>
    </div>

    <!-- Option 2: Load a Partner JSON File -->
    <div class="option">
        <h3>Load a Partner JSON File</h3>
        <input type="file" on:change={handleFileChange}/>
        <button on:click={uploadFile}>Upload</button>
    </div>

    <!-- Option 3: Select an Existing Partner -->
    <div class="option">
        <h3>Select an Existing Partner</h3>
        <select bind:value={selectedPartnerId}>
            <option value="" disabled selected>Select a Partner</option>
            {#each partnerList as partner (partner.id)}
                <option value={partner.id}>{partner.name}</option>
            {/each}
        </select>
        <button on:click={selectPartner}>Select Partner</button>
    </div>
</div>