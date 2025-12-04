<script>
    export let element;
    import ToolTip from "../../ToolTip.svelte";
    import LayerDetail from "./Detail.svelte";
    import RelationshipDetail from "../Relationship/Detail.svelte";

    const isArray = (value) => Array.isArray(value);
    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
</script>

<h1><b>{element.name}</b></h1>
<ToolTip item="{{key:'Description', value:element.description}}">
    <span class="ellipsed-text">{element.description}</span>
</ToolTip>
{#if element.stakeholders }
<h2>Stakeholders</h2>
<ToolTip item="{{key:'Stakeholders', value:element.stakeholders.join(',')}}">
    <span class="ellipsed-text">{element.stakeholders.join(', ')}</span>
</ToolTip>
{/if}
<h2>Purpose</h2>
<ToolTip item="{{key:'Purpose', value:element.purpose}}">
    <span class="ellipsed-text">{element.purpose}</span>
</ToolTip>
{#if element.assets && Object.keys(element.assets).length > 0}
    <h2>Assets</h2>
    <ul class="asset-list">
    {#each Object.entries(element.assets) as [key, asset]}
    <ToolTip item="{{key:'Description', value:asset.description}}">
        <li><a href="{asset.url}" target="_blank">{asset.name} - {asset.description}</a></li>
    </ToolTip>
    {/each}
    </ul>
{/if}

{#if element.relationships && Object.keys(element.relationships).length > 0}
    <h2>Relationships</h2>
    <ul class="asset-list">
        {#each Object.entries(element.relationships) as [key, relationship]}
            <ToolTip item="{{key:'Relationship', value:relationship}}" view='{RelationshipDetail}'>
                <li>{relationship.name}->{relationship.to} - {relationship.description}</li>
            </ToolTip>
        {/each}

    </ul>
{/if}

{#if element.layers && Object.keys(element.layers).length > 0}
    <h2>SubLayers</h2>
    <ul class="asset-list">
        {#each Object.entries(element.layers) as [key, sublayer]}
            <li>
                <ToolTip item="{ { key: sublayer.id, value: sublayer } }" view="{LayerDetail}">
                    <layerItem>{sublayer.name}</layerItem>-{sublayer.description}
                </ToolTip>
            </li>
        {/each}
    </ul>
{/if}

<style>
    .detail-view {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }

    .detail-item {
        margin-bottom: 10px;
    }

    .detail-item label {
        font-weight: 400;
        display: block;
        margin-bottom: 1px;
    }

    .detail-item p {
        margin: 0;
        background: #fff;
        padding: 1px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .asset-list {
        list-style-type: disc; /* Bullet points */
        padding-left: 10px; /* Add some spacing for the bullets */
        margin: 0;
    }
    layerItem {
        font-weight: 500;
        font-style: italic;
        color: #007ACC;
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
        font-size: 0.9rem;
    }
    h1 {
        margin-top: 5px;
        margin-bottom: 0px;
        font-size: 1.0rem;
        font-weight: 400;
        font-style: italic;
        color: #007ACC;
    }
    h2 {
        margin-top: 0px;
        margin-bottom: 0px;
        font-size: 1.0rem;
        font-weight: 500;
    }
    h3 {
        margin-top: 10px;
        margin-bottom: 0px;
        font-size: 1.0rem;
        font-weight: normal;
    }
</style>