<script>
    import '../../../../../web/src/app.css';
    import {writable} from "svelte/store";

    let { children } = $props();
    import { goto } from '$app/navigation';

    import { onMount } from "svelte";
    import ArchitectureTreeView from "../../../../../web/src/components/ArchitectureTreeView.svelte";
    import PartnerTreeView from "../../../../../web/src/components/PartnerTreeView.svelte";
    import MainView from "../../../../../web/src/components/MainView.svelte";
    import ResizableLayout from "../../../../../web/src/components/ResizableLayout.svelte";

    import {selectedNode, theme, selectedPartner, selectedCustomer} from "../../../../../web/src/stores/store.js";
    import { currentPartner } from "../../../../../web/src/stores/partnerStore.js";

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

    async function saveFile(data, fileName = "partner.json") {
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

    async function savePartner() {
        try {
            // Fetch JSON data from the server
            const partnerID = $currentPartner.id;
            const response = await fetch(`/api/partner/save?id=${partnerID}`);

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get the JSON data
            const data = await response.json();

            // Use the saveFile function to allow the user to select where to save the file
            await saveFile(data, 'partner.json');
        } catch (error) {
            console.error(error.message);
        }
    }
    async function exportPartner() {
        try {
            showExporting.set(true);
            // Fetch JSON data from the server
            watchEvents('partner', handleExportEvent);
            exportState.set("analyzing");
            exportText.set('');
            exportItem.set($currentPartner);
            const partnerID = $currentPartner.id;
            const response = await fetch(`/api/partner/export?id=${partnerID}`);

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
    async function analyzeExport() {
        try {
            exportState.set("analyzing");
            exportText.set('');
            exportItem.set($currentPartner);
            const partnerID = $currentPartner.id;
            const response = await fetch(`/api/partner/export?id=${partnerID}&force=true`);

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get the JSON data
            let data = await response.text();
            exportState.set("complete");
        } catch (error) {
            console.error(error.message);
        }
    }
    function closePartner() {
        goto('/');
        currentPartner.set(null);
    }
    function closeExportViewer() {
        showExporting.set(false);
    }
    async function updateExport() {
        const partnerID = $currentPartner.id;
        const content = $exportText;
        const response = await fetch(`/api/partner/updateExport?id=${partnerID}`, {
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
    let menu = [
        { label: 'Save', action: () => { savePartner(); } },
        { label: 'Export', action: () => { exportPartner(); } },
        { label: 'Close', action: () => { closePartner(); } },
    ];
</script>

{#if !$showExporting}
    <ResizableLayout
            LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
            ContentPanel={{component:MainView, props: {menu} }}
            RightPanel={{component:PartnerTreeView, props: {selectedPartner}}}
    />
{:else}
    <ResizableLayout
            LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
            ContentPanel={{component:ExportViewer, props: {onClose: closeExportViewer, onAnalyze: analyzeExport, onStop: stopExport, onSave: updateExport} }}
            RightPanel={{component:PartnerTreeView, props: {selectedPartner}}}
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