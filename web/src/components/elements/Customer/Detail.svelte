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
{#if element.assets && Object.keys(element.assets).length > 0}
    <h3><i>Assets</i></h3>
    <ul class="asset-list">
        {#each Object.entries(element.assets) as [key, asset]}
            <ToolTip item="{{key:'Description', value:asset.description}}">
                <li><a href="{asset.url}" target="_blank">{asset.name} - {asset.description}</a></li>
            </ToolTip>
        {/each}
    </ul>
{/if}

{#if element.phases && Object.keys(element.phases).length > 0}
    <table class="asset-list" width="100%">
        <thead>
        <tr>
        {#each Object.entries(element.phases) as [key, phase]}
            <th>
                <ToolTip item="{ { key: phase.id, value: phase } }">
                    <b><i>{phase.name}</i>
                </ToolTip>
            </th>
        {/each}
        </tr>
        </thead>
        <tbody>
        <tr>
        {#each Object.entries(element.phases) as [key, phase]}
            <td>
                <ul>
                {#each Object.entries(phase.suppliers) as [key, supplier] }
                    <li>
                        <ToolTip item="{ { key: supplier.id, value: supplier } }">
                            <b>{supplier.name}</b> - {Object.keys(supplier.engagements).join(', ')}
                        </ToolTip>
                    </li>
                {/each}
                </ul>
            </td>
        {/each}
        </tr>
        </tbody>
    </table>
{/if}

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