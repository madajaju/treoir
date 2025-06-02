<script>
    import {onMount} from "svelte";
    import {API_BASE_URL} from "../config";
    import {writable} from "svelte/store";
    import {fetchEvents, watchEvents} from "../stores/eventsStore.js";
    import {fetchCurrentCustomer} from "../stores/customerStore.js";
    import {getLayer} from "../stores/layerStore.js";
    import {selectedNode, selectedNodeInfo} from "../stores/store.js";

    export let suggestions = [];
    let suggestionList = writable([]);
    let error = null;

    onMount(() => {
        loadSuggestions();
        fetchEvents();
        watchEvents('suggestion', handleSuggestion);
        watchEvents('engagement', handleEngagement)
    });

    function handleSuggestion(data) {
        // Step 1: Get the current value from the writable store
        let currentArray;
        suggestionList.subscribe(value => { currentArray = value; })();

        // Step 2: Modify the array (e.g., add new data)
        currentArray.push(data);

        // Step 3: Update the writable store with the modified array
        suggestionList.set(currentArray);
    }
    function handleEngagement(engagement) {
        fetchCurrentCustomer();
    }
    async function loadSuggestions() {
        try {
            const response = await fetch(`${API_BASE_URL}/suggestion/list`);
            if (!response.ok) throw new Error("Failed to fetch suggestions");
            const results = await response.json();
            const myList = Object.values(results);
            suggestionList.set(myList);
        } catch (err) {
            console.error("Error loading suggestions:", err);
            error = err.message;
        }
    }

    async function markComplete(id) {
        setState(id, 'completed');
        const response = await fetch(`${API_BASE_URL}/suggestion/accept?id=${id}`, {method: "GET"});
        if(!response.ok) throw new Error("Failed to mark suggestion as completed");
    }
    function handleLayerClick(layer) {
        // select the Layer High level layer.
        // Set the SelectedNode
        let topLayer = layer.split('-')[0];
        let topNode = getLayer(topLayer);
        let node = getLayer(layer);
        selectedNode.set(topNode);

    }

    function setState(id, state) {
        suggestionList.update((suggestions) =>
            suggestions.map((suggestion) =>
                suggestion._attributes.id === id
                    ? {
                        ...suggestion,
                        _attributes: {
                            ...suggestion._attributes,
                            state: state, // Correctly update the nested state property
                        },
                    }
                    : suggestion
            )
        );
    }
    async function refineSuggestion(button, id) {
        setState(id, 'refined');
        button.disabled = true;
        button.innerHTML = '_';
        try {
            const response = await fetch(`${API_BASE_URL}/suggestion/refine?id=${id}`, {method: "GET"});
            if (!response.ok) throw new Error("Failed to refine suggestion");
            const result = await response.json();

            console.log("Refined suggestion result:", result);
        } catch (err) {
            console.error("Error refining suggestion:", err);
        } finally {
            button.disabled = false;
            button.innerHTML = '🔍';
        }
    }

    async function deleteSuggestion(id) {
        setState(id, 'deleted');
        console.log(`Suggestion ${id} deleted.`);
        setState(id, 'completed');
        const response = await fetch(`${API_BASE_URL}/suggestion/?id=${id}`, {method: "GET"});
        if(!response.ok) throw new Error("Failed to mark suggestion as completed");
    }
</script>

<!-- HTML Structure -->
<div class="suggestion-container">
    {#if error}
        <div class="error">{error}</div>
    {/if}

    <table class="suggestion-table">
        <thead>
        <tr>
            <th class="layer-column">Layer</th>
            <th class="suggestion-column">Suggestion</th>
            <th class="description-column">Description</th>
            <th class="actions-column">Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each $suggestionList as suggestion}
            <tr class="{suggestion._attributes.state}-state">
                <td title="{suggestion._attributes.layer}"
                    on:click={() => handleLayerClick(suggestion._attributes.layer)}
                    class="layer-clickable"
                >{suggestion._attributes.layer}</td>
                <td title="{suggestion._attributes.name}">{suggestion._attributes.name}</td>
                <td title="{suggestion._attributes.description}">{suggestion._attributes.description}</td>
                <td>
                    {#if suggestion._attributes.state !== 'completed' && suggestion._attributes.state !== 'deleted'}
                    <button on:click={() => markComplete(suggestion._attributes.id)} class="action-btn completed">✔</button>
                    {/if}
                    {#if suggestion._attributes.state !== 'completed' && suggestion._attributes.state !== 'deleted' && suggestion._attributes.state !== 'refined'}
                    <button id="refine-{suggestion._attributes.id}"
                            on:click={(event) => refineSuggestion(event.target, suggestion._attributes.id)}
                            class="action-btn refine">🔍
                    </button>
                    {/if}
                    {#if suggestion._attributes.state !== 'completed' && suggestion._attributes.state !== 'deleted'}
                    <button on:click={(event) => deleteSuggestion(suggestion._attributes.id)} class="action-btn deleted">✖</button>
                    {/if}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    .suggestion-container {
        padding: 8px;
        font-family: Arial, sans-serif;
        overflow-x: hidden; /* Prevent horizontal overflow */
        max-width: 100%; /* Ensure the container stays within its parent size */
    }

    .error {
        color: red;
        margin-bottom: 1rem;
    }

    /* Table styles */
    .suggestion-table {
        width: 100%; /* Stretch the table to fit the container */
        border-collapse: collapse; /* Remove gaps between cells */
        font-size: 0.8rem;
        table-layout: fixed; /* Ensure columns maintain fixed widths */
    }

    .suggestion-table th,
    .suggestion-table td {
        border: 1px solid #ddd;
        padding: 4px 8px;
        text-align: left;
        white-space: nowrap; /* Prevent multi-line text */
        overflow: hidden; /* Hide overflow */
        text-overflow: ellipsis; /* Use ellipsis for truncated content */
    }

    .suggestion-table th {
        background-color: #f4f4f4; /* Light gray background for header */
        font-weight: bold;
    }

    tr:hover {
        background-color: #cccccc; /* Highlight on hover */
    }

    /* Individual column styles for better control */
    .layer-column {
        width: 20%; /* Set specific widths for columns */
    }

    .suggestion-column {
        width: 30%;
    }

    .description-column {
        width: 40%;
    }

    .actions-column {
        width: 65px; /* Allow actions column to automatically size */
        white-space: normal; /* Allow wrapping inside this column */
        overflow: visible; /* Ensure content is not hidden */
        text-align: center;
    }

    /* Button styles */
    .action-btn {
        margin: 0 0.0rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .completed-state {
        color: black;
        background-color: lightgreen;
    }
    .completed-state:hover {
        background-color: darkgreen;
    }
    .deleted-state {
        color: black;
        background-color: pink;
    }
    .deleted-state:hover {
        background-color: darkred;
    }
    .refined-state {
        color: black;
        background-color: lightblue;
    }
    .refined-state:hover {
       background-color: darkblue;
    }
    .completed {
        color: green;
    }

    .refine {
        color: blue;
    }

    .deleted {
        color: red;
    }
</style>