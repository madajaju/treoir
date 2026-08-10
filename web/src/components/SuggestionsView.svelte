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
    function handleSuggestion(trigger) {
        // Step 1: Get the current value from the writable store
        let currentArray = [];
        let data = trigger.data;
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
            // console.error("Error loading suggestions:", err);
            //error = err.message;
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
        setState(id, 'refine');
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
            setState(id, 'refined');
        }
    }

    async function deleteSuggestion(id) {
        setState(id, 'deleted');
        const response = await fetch(`/api/suggestion/reject?id=${id}`, {method: "GET"});
        if(!response.ok) throw new Error("Failed to mark suggestion as completed");
    }
</script>

<style>

    .table-container {
        overflow-y: auto;         /* vertical scrollbar */
        border: 1px solid #ccc;   /* optional */
        overflow-x: hidden;       /* prevent horizontal scroll */
    }
    .table-container table {
        width: 100vw;
        border-collapse: collapse; /* optional but common */
        table-layout: fixed;       /* optional: makes columns equal/controlled */
    }

    /* Keep header visible while scrolling (optional but nice) */
    .table-container thead th {
        position: sticky;
        top: 0;
        background: white;        /* or your header bg */
        z-index: 1;
    }
    .error {
        color: red;
        margin-bottom: 1rem;
    }

    /* Table styles */
    .suggestion-table {
        max-width: 100%;
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

    .refine-state {
        background-color: blue;
        color: white;
        cursor: progress;
    }

    .deleted {
        color: red;
    }
</style>
<!-- HTML Structure -->
<div id="suggestion-container" style="display: flex; flex-direction: column; height: 100%; border: 1px solid #ddd;">
    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="table-container">
    <table class="suggestion-table">
        <thead>
        <tr>
            <th class="suggestion-column">Element Name</th>
            <th class="layer-column">Layer</th>
            <th class="description-column">Description</th>
            <th class="actions-column">Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each $suggestionList as suggestion}
            <tr class="{suggestion.state}-state">
                <td title="{suggestion.name}"
                    on:click={() => handleLayerClick(suggestion, suggestion.layer)}
                >
                    {#if suggestion?._associations?.referring}
                        <div>&nbsp;&nbsp;↳ {suggestion.name}</div>
                    {:else}
                        {suggestion.name}
                    {/if}
                </td>
                <td title="{suggestion.layer}"
                    on:click={() => handleLayerClick(suggestion, suggestion.layer)}
                    class="layer-clickable"
                >
                    {#if suggestion.state === 'Selected'}
                        <button title="Select Layer in diagram and click to update" style="cursor: pointer; color: blue;"
                            on:click={() => handleUpdateLayer(suggestion)}
                            class="layer-clickable"
                        >➡️</button>
                    {/if}
                    {suggestion.layer.split('-').slice(-1)}</td>
                <td title="{suggestion.description}"
                    on:click={() => handleLayerClick(suggestion, suggestion.layer)}
                >{suggestion.description}</td>
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
</div>
