<script>
    import '../../../../../web/src/app.css';

    let { children } = $props();
    import { goto } from '$app/navigation';

    import { onMount } from "svelte";
    import ArchitectureTreeView from "../../../../../web/src/components/ArchitectureTreeView.svelte";
    import PartnerTreeView from "../../../../../web/src/components/PartnerTreeView.svelte";
    import MainView from "../../../../../web/src/components/MainView.svelte";
    import ResizableLayout from "../../../../../web/src/components/ResizableLayout.svelte";

    import { selectedNode, theme, selectedPartner } from "../../../../../web/src/stores/store.js";
    import { currentPartner } from "../../../../../web/src/stores/partnerStore.js";
    import {API_BASE_URL} from "../../../../../web/src/config";

    onMount(() => {
        document.documentElement.setAttribute("data-theme", $theme);
    });

    function changeTheme(newTheme) {
        theme.set(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
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

    async function exportPartner() {
        try {
            // Fetch JSON data from the server
            const partnerID = $currentPartner.id;
            const response = await fetch(`${API_BASE_URL}/partner/export?id=${partnerID}`);

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
    function closePartner() {
        goto('/');
        currentPartner.set(null);
    }
    let menu = [
        { label: 'Export', action: () => { exportPartner(); } },
        { label: 'Close', action: () => { closePartner(); } },
    ];
</script>

<ResizableLayout
        LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
        ContentPanel={{component:MainView, props: {menu} }}
        RightPanel={{component:PartnerTreeView, props: {selectedPartner}}}
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