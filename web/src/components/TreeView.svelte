<script>
    import TreeNode from "./TreeNode.svelte";

    export let nodes;
    export let title ="";

    let isLoading = false;
    let error = null

</script>
<div class="bg-white p-2 rounded shadow">
    <h3><b><i>{title}</i></b></h3>
    <ul>
        {#each nodes as node}
            <TreeNode {node} />
        {/each}
    </ul>
</div>
