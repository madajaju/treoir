<script>
    import {onMount} from "svelte";
    import {API_BASE_URL} from "../config";
    import {writable} from "svelte/store";
    import {fetchEvents, watchEvents} from "../stores/eventsStore.js";
    import {fetchCurrentCustomer, currentCustomer} from "../stores/customerStore.js";
    import {fetchCurrentPartner, currentPartner} from "../stores/partnerStore.js";
    import {getLayer} from "../stores/layerStore.js";
    import {selectedNode, selectedNodeInfo, highlightedLayer} from "../stores/store.js";

    export let suggestions = [];
    let suggestionList = writable([]);
    let error = null;
    let selectedSuggestion = null;

    onMount(() => {
        loadSuggestions();
        fetchEvents();
        watchEvents('suggestion', handleSuggestion);
        watchEvents('engagement', handleEngagement);
        watchEvents('element', handleElement);
    });

    function handleElement(data) {
        if($currentPartner) {
            fetchCurrentPartner();
        }
    }
    function handleSuggestion(data) {
        // Step 1: Get the current value from the writable store
        let currentArray = [];
        suggestionList.subscribe(value => { currentArray = value; })();

        // Step 1b: Normalize the data.
        if(data._attributes) {
            data = {...data, ...data._attributes};
            delete data._attributes;
        }
        // Step 2: Modify the array (e.g., add new data)
        // We need to check the layer and the name of the suggestion to determine if we should add it or update the current one.
        let flag = false;
        for(let i in currentArray) {
            let item = currentArray[i];
            if(item.layer === data.layer && item.name === data.name) {
                currentArray[i] = data;
                flag = true;
                break;
            }
        }
        if(!flag) {
            currentArray.push(data);
        }

        // Now sort the array by the name and then the layer.
        currentArray = currentArray.sort((a, b) => {
            if (a.name === b.name) {
                return a.layer.localeCompare(b.layer);
            }
            return a.name.localeCompare(b.name);
        });

        // Step 3: Update the writable store with the modified array
        suggestionList.set(currentArray);
    }
    function handleEngagement() {
        fetchCurrentCustomer();
    }
    async function loadSuggestions() {
        try {
            let url = "";
            if($currentPartner) {
                let id = $currentPartner.id;
                url = `/api/partner/suggestions?id=${id}`;
            }
            if($currentCustomer) {
                let id = $currentCustomer.id;
                url = `/api/customer/suggestions?id=${id}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch suggestions");
            const results = await response.json();

            let myList = Object.values(results);

            // Uplevel _attributes properties to main object
            // This handles events  and elements.
            myList = myList.map(item => {
                if (item._attributes) {
                    return {...item, ...item._attributes};
                }
                return item;
            });


            myList = myList.sort((a, b) => {
                if (a.name === b.name) {
                    return a.layer.localeCompare(b.layer);
                }
                return a.name.localeCompare(b.name);
            });
            suggestionList.set(myList);
        } catch (err) {
            console.error("Error loading suggestions:", err);
            error = err.message;
        }
    }

    async function markComplete(id) {
        setState(id, 'completed');
        const response = await fetch(`/api/suggestion/accept?id=${id}`, {method: "GET"});
        if(!response.ok) throw new Error("Failed to mark suggestion as completed");
    }
    function handleLayerClick(sugg,layer) {
        // select the Layer High level layer.
        // Set the SelectedNode
        let topLayer = layer.split('-')[0];
        let topNode = getLayer(topLayer);
        let node = getLayer(layer);
        selectedNode.set(topNode);
        highlightedLayer.set(node);
        selectedNodeInfo.set(node);
        if(selectedSuggestion) {
            setState(selectedSuggestion.id, selectedSuggestion.previousState);
        }
        sugg.previousState = sugg.state;
        setState(sugg.id, "Selected");
        selectedSuggestion = sugg;
    }
    async function handleUpdateLayer(sugg) {
       let newLayer = $selectedNodeInfo;
       sugg.layer = newLayer.id;
       setState(sugg.id,"Edited");
       sugg.previousState = "Edited";
        const response = await fetch(`/api/suggestion/update?id=${sugg.id}&layer=${newLayer.id}`, {method: "GET"});
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const results = await response.json();
        console.log(results);

    }

    function setState(id, state) {
        suggestionList.update((suggestions) =>
            suggestions.map((suggestion) =>
                suggestion.id === id
                    ? {
                        ...suggestion,
                        state: state
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
            const response = await fetch(`/api/suggestion/refine?id=${id}`, {method: "GET"});
            if (!response.ok) throw new Error("Failed to refine suggestion");
            const result = await response.json();

        } catch (err) {
            console.error("Error refining suggestion:", err);
        } finally {
            button.disabled = false;
            button.innerHTML = '🔍';
        }
    }

    async function deleteSuggestion(id) {
        setState(id, 'deleted');
        const response = await fetch(`/api/suggestion/reject?id=${id}`, {method: "GET"});
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
            <th class="update-column"></th>
            <th class="layer-column">Layer</th>
            <th class="suggestion-column">Suggestion</th>
            <th class="description-column">Description</th>
            <th class="actions-column">Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each $suggestionList as suggestion}
            <tr class="{suggestion.state}-state">
                {#if suggestion.state === 'Selected'}
                    <td title="Click to update Layer"
                        on:click={() => handleUpdateLayer(suggestion)}
                        class="layer-clickable"
                    >➡️</td>
                {:else}
                    <td></td>
                {/if}
                <td title="{suggestion.layer}"
                    on:click={() => handleLayerClick(suggestion, suggestion.layer)}
                    class="layer-clickable"
                >{suggestion.layer.split('-').slice(-1)}</td>
                <td title="{suggestion.name}">{suggestion.name}</td>
                <td title="{suggestion.description}">{suggestion.description}</td>
                <td>
                    {#if suggestion.state !== 'completed' && suggestion.state !== 'deleted' && suggestion.state !== 'Accepted' && suggestion.state !== 'Rejected'}
                    <button on:click={() => markComplete(suggestion.id)} class="action-btn completed">✔</button>
                    {/if}
                    {#if suggestion.state !== 'completed' && suggestion.state !== 'deleted' && suggestion.state !== 'refined' && suggestion.state !== 'Accepted' && suggestion.state !== 'Rejected'}
                    <button id="refine-{suggestion.id}"
                            on:click={(event) => refineSuggestion(event.target, suggestion.id)}
                            class="action-btn refine">🔍
                    </button>

                    {/if}
                    {#if suggestion.state !== 'completed' && suggestion.state !== 'deleted' && suggestion.state !== 'Accepted' && suggestion.state !== 'Rejected'}
                    <button on:click={(event) => deleteSuggestion(suggestion.id)} class="action-btn deleted">✖</button>
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
    .update-column {
        width: 30px; /* Allow actions column to automatically size */
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
    .Selected-state {
        color: black;
        background-color: yellow;
    }
    .Selected-state:hover {
        color: black;
        background-color: yellow;
    }
    .Edited-state {
        color: black;
        background-color: lightblue;
    }
    .Edited-state:hover {
        color: white;
        background-color: darkblue;
    }
    .Accepted-state {
        color: black;
        background-color: lightgreen;
    }
    .Accepted-state:hover {
        background-color: darkgreen;
    }
    .Refined-state {}
    .completed-state {
        color: black;
        background-color: lightgreen;
    }
    .completed-state:hover {
        background-color: darkgreen;
    }
    .Rejected-state {
        color: black;
        background-color: pink;
    }
    .Rejected-state:hover {
        background-color: darkred;
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