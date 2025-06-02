<script>
    export let element;
    import ToolTip from "../../ToolTip.svelte";
    import LayerDetail from "./Detail.svelte";

    const isArray = (value) => Array.isArray(value);
    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
</script>

<h1><b>{element.name}</b></h1>
<ToolTip item="{{key:'Description', value:element.description}}">
    <span class="ellipsed-text">{element.description}</span>
</ToolTip>

{#each Object.entries(element || {}) as [key, value]}
    {#if key[0] !== '_'}
        <ToolTip item="{{key:key, value:value}}">
            <!-- Value Handling -->
            <span class="text-gray-600 text-sm text-right w-1/3 pr-3">
                {key}
            </span>
            {#if isArray(value)}
                <!-- If value is an array, show count and arrow -->
                <span class="text-blue-800 text-sm font-semibold truncate w-2/3"
                      style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        {#each value as v}
                                            {#if v.name}
                                                {v.name},
                                            {:else if v.id}
                                                {v.id},
                                            {:else}
                                                Object,
                                            {/if}
                                        {/each}
                    ({value.length})
                                    </span>
                <span class="w-4 h-4 ml-2 text-blue-500 flex-shrink-0 ailtire-expanded"></span>
            {:else if isObject(value)}
                <!-- If value is an object, just show arrow -->
                <span class="text-blue-800 text-sm font-semibold truncate w-2/3"
                      style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        {#each Object.keys(value) as vkey}
                                            {vkey}: ...,
                                        {/each}
                                    </span>
                <span class="w-4 h-4 ml-2 text-blue-500 flex-shrink-0 ailtire-expanded"></span>
            {:else}
                <!-- If value is a string, truncate text if it's too long -->
                <span class="text-gray-800 text-sm font-semibold truncate w-2/3"
                      style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        {value}
                                    </span>
            {/if}
        </ToolTip>
    {/if}
{/each}

<style>
    .detail-view {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }

    .detail-item {
        margin-bottom: 15px;
    }

    .detail-item label {
        font-weight: bold;
        display: block;
        margin-bottom: 5px;
    }

    .detail-item p {
        margin: 0;
        background: #fff;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .asset-list {
        list-style-type: disc; /* Bullet points */
        padding-left: 20px; /* Add some spacing for the bullets */
        margin: 0;
    }

    .asset-list li {
        white-space: nowrap; /* Prevent wrapping to a new line */
        overflow: hidden; /* Hide overflowing content */
        text-overflow: ellipsis; /* Display ellipsis for overflow */
        max-width: 100%; /* Adjust this width depending on your container */
        font-size: 0.9rem; /* Adjust font size if needed */
    }

    .asset-list li a {
        color: #007ACC; /* Link color */
        text-decoration: none; /* Remove underline */
    }
    .ellipsed-text {
        display: inline-block; /* Ensure it acts like a block for proper width measurement */
        max-width: 100%; /* Ensures it stays within the container width */
        white-space: nowrap; /* Prevents wrapping to a new line */
        overflow: hidden; /* Hides overflowing content */
        text-overflow: ellipsis; /* Adds "..." for overflowing content */
    }
</style>