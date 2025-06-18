<script>
    export let element;
    import ToolTip from "../../ToolTip.svelte";

    const isArray = (value) => Array.isArray(value);
    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
</script>

<h1>
<span style="display: inline-block; width: 1em; height: 1em; background-color: {phase.color || '#ffff00'}; margin-right: 0.5em;"></span>
{element.name}</h1>
<ToolTip item="{{key:'Description', value:element.description}}">
    <span class="ellipsed-text">{element.description}</span>
</ToolTip>

<div>
<label for="targetDate">Target Date:</label>
<span>{element.targetDate}</span>
</div>

<div>
    <label for="kpis">KPIs</label>
    <span>{element.kpis}</span>
</div>
{#if element.suppliers && Object.keys(element.suppliers).length > 0}
    <h3><i>Suppliers</i></h3>
    <ul class="supplier-list">
        {#each Object.entries(element.suppliers) as [key, supplier]}
            <ToolTip item="{{key:'Description', value:supplier.description}}">
                <li>{supplier.name} - {supplier.description} ({Object.keys(supplier.engagements).length})</li>
            </ToolTip>
        {/each}
    </ul>
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
    .supplier-list {
        list-style-type: disc; /* Bullet points */
        padding-left: 20px; /* Add some spacing for the bullets */
        margin: 0;
    }

    .supplier-list li {
        white-space: nowrap; /* Prevent wrapping to a new line */
        overflow: hidden; /* Hide overflowing content */
        text-overflow: ellipsis; /* Display ellipsis for overflow */
        max-width: 100%; /* Adjust this width depending on your container */
        font-size: 0.9rem; /* Adjust font size if needed */
    }

    .supplier-list li a {
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