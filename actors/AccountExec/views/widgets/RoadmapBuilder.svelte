<script>
    export let roadmap = []; // Input: Roadmap milestones array
    export let editable = false; // Input: Allows editing milestones if true

    function addMilestone() {
        roadmap.push({ milestone: "New Milestone", date: "TBD" });
    }
</script>

<div class="roadmap-builder">
    <h2>Customer Roadmap</h2>
    <ul>
        {#each roadmap as milestone, index}
            <li>
                {editable
                    ? <input value={milestone.milestone} type="text" />
                    : milestone.milestone} - {milestone.date}
            </li>
        {/each}
    </ul>

    {#if editable}
        <button on:click={addMilestone}>Add Milestone</button>
    {/if}
</div>

<style>
    .roadmap-builder {
        border: 1px solid green;
        padding: 1rem;
        background: #e5f7e5;
        margin: 1rem 0;
        border-radius: 0.5rem;
    }
</style>