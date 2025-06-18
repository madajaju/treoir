<script>
    import {selectedNode} from "../stores/store.js"
    import {Generic} from "./elements/Generic";
    import MDEditor from "./MDEditor.svelte";
    import {writable} from "svelte/store";
    import {API_BASE_URL} from "../config.js";
    export let currentView;

    const elementView = Generic.Form;

    let markdownContent = writable("TBD");
    let defaultSchema = {
        attributes: {
            name: {
                type: "string",
                required: true,
                description: "Name of the element"
            },
            description: {
                type: "text",
                required: false,
                description: "Description of the element"
            }
        }
    };

    $: if(currentView === "Documentation" && $selectedNode) {
        fetchDocumentation($selectedNode);
        fetchSchema($selectedNode);
    }
    async function fetchDocumentation(node) {
        if (!node || !node.expandLink) return;

        try {
            markdownContent.set(""); // Reset content when fetching starts

            const response = await fetch(node.expandLink + '&doc=true'); // AJAX call for documentation
            if(response.status !== 200) throw new Error( response.statusText)
            let data = await response.json();
            markdownContent.set(data.document); // Update content
        } catch (error) {
            console.error(error);
        }
    }
    async function fetchSchema(node) {
        if(node._schema) {
            return
        }
        try {
            const response = await fetch(`/api/class/definition?name=${node._type}`); // AJAX call for documentation
            if(response.status !== 200) throw new Error( response.statusText);
            let data = await response.json();
            node._schema = data;
            $selectedNode = {...node};
        }
        catch(error) {
            console.error(error);
        }
    }
    async function fetchGenAI() {
        let node = $selectedNode;
        if (!node || !node.type) return;
        let genLink = `/api/${node.type.toLowerCase()}/generate?id=${node.id}&target=Documentation`;
        const response = await fetch(genLink); // AJAX call for documentation
        if(response.status !== 200) throw new Error( response.statusText)
        let data = await response.text();
        markdownContent.set(data); // Update content
    }
    function handleUpdate(event) {
        markdownContent.set(event.detail);
    }

</script>

<div class={`h-full overflow-auto`}>
    <div class="bg-white p-4 border-r shadow">
        {#if $selectedNode}
            <p>Details about node ID: <strong>{$selectedNode.name}</strong></p>
            <div class="mt-4 space-y-2">
                {#if $selectedNode?._view?.hasOwnProperty("Form")}
                    <svelte:component this={$selectedNode._view.Form} data={$selectedNode} />
                {:else}
                    {#if $selectedNode?._schema}
                        <svelte:component this={elementView} element={$selectedNode} schema={$selectedNode._schema} />
                    {:else}
                        <svelte:component this={elementView} element={$selectedNode} schema={defaultSchema } />
                    {/if}
                {/if}
            </div>
            <label for="details">Details</label>
            <MDEditor bind:md={$markdownContent}
                      on:update={handleUpdate}
                      genai={fetchGenAI}
            />
        {:else}
            <p>No node selected.</p>
        {/if}
    </div>
</div>

<style>
    .graph-container {
        width: 100%;
        height: 100%;
        position: relative; /* This ensures proper layout handling */
    }

    /* Ensure the parent container also uses a size */
    .parent-container {
        height: 100%; /* 100% of the page viewport */
        overflow: hidden; /* Prevent unnecessary scrollbars */
    }
</style>
