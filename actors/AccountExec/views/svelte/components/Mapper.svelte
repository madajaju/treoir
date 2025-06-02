<script>
    import '../../../../../web/src/app.css';

    let { children } = $props();
    import { goto } from '$app/navigation';

    import { onMount } from "svelte";
    import ArchitectureTreeView from "../../../../../web/src/components/ArchitectureTreeView.svelte";
    import CustomerTreeView from "../../../../../web/src/components/CustomerTreeView.svelte";
    import MainView from "../../../../../web/src/components/MainView.svelte";
    import ResizableLayout from "../../../../../web/src/components/ResizableLayout.svelte";

    import { selectedNode, theme, selectedCustomer } from "../../../../../web/src/stores/store.js";
    import { currentCustomer } from "../../../../../web/src/stores/customerStore.js";
    import {API_BASE_URL} from "../../../../../web/src/config";

    onMount(() => {
        document.documentElement.setAttribute("data-theme", $theme);
    });

    function changeTheme(newTheme) {
        theme.set(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }
    async function saveFile(data, fileName = "customer.json") {
        try {
            // New file handle for creating/saving the file
            const options = {
                suggestedName: fileName,
                types: [
                    {
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    },
                ],
            };

            const handle = await window.showSaveFilePicker(options);

            // Create a writable stream
            const writable = await handle.createWritable();

            // Write the JSON data to the file
            await writable.write(JSON.stringify(data, null, 2));

            // Close the stream
            await writable.close();

            console.log('File saved successfully!');
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    async function exportCustomer() {
        try {
            // Fetch JSON data from the server
            const customerID = $currentCustomer.id;
            const response = await fetch(`${API_BASE_URL}/customer/export?id=${customerID}`);

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get the JSON data
            const data = await response.json();

            // Use the saveFile function to allow the user to select where to save the file
            await saveFile(data, 'customer.json');
        } catch (error) {
            console.error(error.message);
        }
    }
    function closeCustomer() {
        goto('/');
        currentCustomer.set(null);
    }
    let menu = [
        { label: 'Export', action: () => { exportCustomer(); } },
        { label: 'Close', action: () => { closeCustomer(); } },
    ];
</script>

<ResizableLayout
        LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
        ContentPanel={{component:MainView, props: {menu} }}
        RightPanel={{component:CustomerTreeView, props: {selectedCustomer}}}
/>

<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    .header {
        height: 50px;
        background-color: #000000;
        display: flex;
    }
    .footer {
        height: 40px;
        display: flex;
    }
    .top-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
    main {
        padding: 0;
    }
    .main-content {
        padding: 0;
        flex-grow: 1;
        overflow: auto;
    }
</style>