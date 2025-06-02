<script>
    import {selectedValue} from "../stores/store.js";
    import ToolTip from "./ToolTip.svelte";
    export let cls = "";

    import {Object} from "./elements/Object";

    let elementView = Object.Detail;
    $: if($selectedValue) {
        if($selectedValue.view) {
            elementView = $selectedValue.view;
        }
    }
    const isArray = (value) => Array.isArray(value);

    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

</script>

<div class={`h-full overflow-auto ${cls}`}>
    {#if $selectedValue}
        <div class="mt-4">
            {#if isArray($selectedValue.value)}
                <svelte:component this={elementView} element={$selectedValue.value} />
            {:else if isObject($selectedValue.value)}
                <svelte:component this={elementView} element={$selectedValue.value} />
            {:else}
                <div class="flex justify-between items-center border-b pb-1 hover:bg-gray-50 cursor-pointer">
                    {$selectedValue.value}
                </div>
            {/if}
        </div>
    {:else}
        <p>No node selected.</p>
    {/if}
</div>
