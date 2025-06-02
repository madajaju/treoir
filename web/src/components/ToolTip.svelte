<script>
    import {selectedValue} from "../stores/store.js";

    export let background = "#ffffaa";
    export let color = "#000000";
    export let item = null;
    export let view = null;

    let hoverDetail = ""; // Store the hover text to be displayed as a tooltip
    let showTooltip = false; // Boolean to toggle tooltip visibility
    let tooltipPosition = {x: 0, y: 0}; // Coordinates where the tooltip should appear
    const isArray = (value) => Array.isArray(value);

    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
    const selectValue = (item) => {
        let newValue = {key: item.key, value: item.value, view: view || null};
        selectedValue.set(newValue);
    }

    export const handleMouseEnter = (event, item) => {
        showTooltip = true;
        tooltipPosition = {x: event.clientX + 10, y: event.clientY + 10}; // Position tooltip near the cursor
        if (isArray(item.value)) {
            hoverDetail = `<strong>${item.key}:</strong> Array (<i>${item.value.length}</i>)`;
        } else if (isObject(item.value)) {
            hoverDetail = `<ul>`;
            for (let vname in item.value) {
                if (vname[0] != '_') {
                    let stringValue = item.value[vname];
                    if (isObject(item.value[vname])) {
                        stringValue = Object.keys(item.value[vname]).join("... , ") + '...';
                    }
                    hoverDetail += `<li><strong>${vname}:</strong> <span>${stringValue}</span></li>`;
                }
            }
            hoverDetail += `</ul>\n`;
        } else {
            hoverDetail = `<strong>${item.key}:</strong> ${item.value}`;
        }
    };

    // Function to handle mouseleave (hover out)
    export const handleMouseLeave = () => {
        showTooltip = false; // Hide tooltip when mouse leaves
        hoverDetail = "";
    };
</script>
<div class="cursor-pointer"
     onmouseenter={(event) => handleMouseEnter(event, item)}
     onmousemove={(event) => (tooltipPosition = { x: event.clientX + 10, y: event.clientY + 10 })}
     onmouseleave={handleMouseLeave}
     onclick={() => selectValue(item)}>
    <slot></slot>
</div>
{#if showTooltip}
<div class="fixed tooltip"
     style="background: {background}; color:{color}; top: {tooltipPosition.y}px; left: {tooltipPosition.x}px; pointer-events: none; transform: rotate(-1deg);">
    {@html hoverDetail}
</div>
{/if}

<style>
    /* Tooltip styles */
    .tooltip {
        text-align: left;
        white-space: normal; /* Allow the text to wrap if necessary */
        max-width: 50vw; /* Tooltip width cannot exceed half the screen’s width */
        overflow: hidden; /* Hide overflowing content if tooltip height gets excessive */
        text-overflow: ellipsis; /* Gracefully crop text if needed */
        background: #ffffaa; /* Default tooltip background */
        color: #000; /* Default tooltip text color */
        z-index: 9999; /* Ensure tooltip appears above other elements */
        border-radius: 0.25rem; /* Slightly rounded corners */
        padding: 0.5rem 1rem; /* Add spacing inside the tooltip */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Provide subtle shadow for better visibility */
        border: 1px solid #ffaa00; /* Optional border to highlight tooltip */
        transform: rotate(-1deg); /* Keep tooltip rotation */
    }
</style>
