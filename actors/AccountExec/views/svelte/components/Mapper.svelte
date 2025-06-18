<script>
    import '../../../../../web/src/app.css';

    let { children } = $props();
    import { goto } from '$app/navigation';
    import {writable} from "svelte/store";
    import {marked} from "marked";
    import { onMount } from "svelte";
    import ArchitectureTreeView from "../../../../../web/src/components/ArchitectureTreeView.svelte";
    import CustomerTreeView from "../../../../../web/src/components/CustomerTreeView.svelte";
    import MainView from "../../../../../web/src/components/MainView.svelte";
    import ResizableLayout from "../../../../../web/src/components/ResizableLayout.svelte";

    import { selectedNode, theme, selectedCustomer } from "../../../../../web/src/stores/store.js";
    import { currentCustomer} from "../../../../../web/src/stores/customerStore.js";
    import { exportState, exportText, exportItem } from "../../../../../web/src/stores/exportStore.js";
    import {watchEvents} from "../../../../../web/src/stores/eventsStore";
    import ExportViewer from "../../../../../web/src/components/ExportViewer.svelte";

    let showExporting = writable(false);

    onMount(() => {
        document.documentElement.setAttribute("data-theme", $theme);
    });

    function handleExportEvent(event) {
        if(event.status === 'svg') {
            exportText.update(current => current + '\n' + event.text);
        } else if(event.status === 'complete') {
            exportText.set(event.text);
            exportState.set("complete");
        }
        else {
            exportText.update(current => current + '\n' + event.text);
        }
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

    async function saveCustomer() {
        try {
            // Fetch JSON data from the server
            const customerID = $currentCustomer.id;
            const response = await fetch(`/api/customer/save?id=${customerID}`);

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
    async function analyzeExport() {
        try {
            exportState.set("analyzing");
            exportText.set('');
            exportItem.set($currentCustomer);
            const customerID = $currentCustomer.id;
            const response = await fetch(`/api/customer/export?id=${customerID}&force=true`);

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get the JSON data
            let data = await response.text();
            // Do not tak the data and set it to the exportText
            // The complete event will take care of that.
            // exportText.set(data);
            exportState.set("complete");
        } catch (error) {
            console.error(error.message);
        }
    }
    async function exportCustomer() {
        try {
            showExporting.set(true);
            // Fetch JSON data from the server
            watchEvents('customer', handleExportEvent);
            exportState.set("analyzing");
            exportText.set('');
            exportItem.set($currentCustomer);
            const customerID = $currentCustomer.id;
            const response = await fetch(`/api/customer/export?id=${customerID}`);

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get the JSON data
            let data = await response.text();
            // Do not tak the data and set it to the exportText
            // The complete event will take care of that.
            // exportText.set(data);
            exportState.set("complete");
        } catch (error) {
            console.error(error.message);
        }
    }

    function closeCustomer() {
        goto('/');
        currentCustomer.set(null);
    }
    let menu = [
        { label: 'Save', action: () => { saveCustomer(); } },
        { label: 'Export', action: () => { exportCustomer(); } },
        { label: 'Close', action: () => { closeCustomer(); } },
    ];
    function closeExportViewer() {
        showExporting.set(false);
    }
    async function updateExport() {
        const customerID = $currentCustomer.id;
        const content = $exportText;
        const response = await fetch(`/api/customer/updateExport?id=${customerID}`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({text: content}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        alert('Saved successfully!');
    }
    function stopExport() {

    }
</script>

{#if !$showExporting}
    <ResizableLayout
            LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
            ContentPanel={{component:MainView, props: {menu} }}
            RightPanel={{component:CustomerTreeView, props: {selectedCustomer}}}
    />
{:else}
    <ResizableLayout
            LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
            ContentPanel={{component:ExportViewer, props: {onClose: closeExportViewer, onAnalyze: analyzeExport, onStop: stopExport, onSave: updateExport} }}
            RightPanel={{component:CustomerTreeView, props: {selectedCustomer}}}
    />
{/if}

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