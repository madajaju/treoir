<script>
    export let element;
    import ToolTip from "../../ToolTip.svelte";
    import LayerDetail from "./Detail.svelte";

</script>


<ToolTip item="{{key:'From', value:element.from}}" view="{LayerDetail}">
    <span class="ellipsed-text"><layerItem>{element.from}</layerItem></span>
</ToolTip>
<ToolTip item="{{key:'', value:element.name}}">
    <span class="ellipsed-text">{element.name}</span>
</ToolTip>
<ToolTip item="{{key:'From', value:element.to}}" view="{LayerDetail}">
    <span class="ellipsed-text"><layerItem>{element.to}</layerItem></span>
</ToolTip>
<ToolTip item="{{key:'Description', value:element.description}}">
    <span class="ellipsed-text">{element.description}</span>
</ToolTip>

<style>
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