<script>
    import {selectedNode, selectedNodeInfo, selectedValue, selectedClass, selectedClassList} from "../stores/store.js";
    import {Element} from "./elements/Element";
    import ToolTip from "./ToolTip.svelte";
    export let cls = "";
    const elementView = Element.Detail;
    import {Model} from "./elements/Model";
    const isArray = (value) => Array.isArray(value);

    // Helper function to determine if the value is an object but NOT an array
    const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
</script>

<div class={`h-full overflow-auto ${cls}`}>
    <div class="bg-white p-2 border-r shadow">
        {#if $selectedNodeInfo}
            <div class="">
                {#if $selectedNodeInfo?._view?.hasOwnProperty('Detail')}
                    <svelte:component this={$selectedNodeInfo._view.Detail} element={$selectedNodeInfo} />
                {:else}
                    <svelte:component this={elementView} element={$selectedNodeInfo} />
                {/if}
            </div>
        {:else if $selectedNode}
            <div class="">
                {#if $selectedNode?._view?.hasOwnProperty('Detail')}
                    <svelte:component this={$selectedNode._view.Detail} element={$selectedNode} />
                {:else}
                    <svelte:component this={elementView} element={$selectedNode} />
                {/if}
            </div>
        {:else if $selectedClass}
            {#if $selectedClass?._view?.hasOwnProperty('Table')}
                <svelte:component this={$selectedClass._view.Table} model={$selectedClass} data={$selectedClassList}/>
            {:else}
                <svelte:component this={Model.Table} model={$selectedClass} />
            {/if}
        {:else}
            <p>No node selected.</p>
        {/if}
    </div>
</div>
