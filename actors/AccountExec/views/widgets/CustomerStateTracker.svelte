<script>
    export let states = { current: "", next: "", future: "" }; // Input: Customer states map
</script>

<div class="customer-states">
    <h2>Customer Journey States</h2>
    <ul>
        <li><strong>Current State:</strong> {states.current}</li>
        <li><strong>Next State:</strong> {states.next}</li>
        <li><strong>Future State:</strong> {states.future}</li>
    </ul>
</div>

<style>
    .customer-states {
        border: 1px solid blue;
        padding: 1rem;
        background: #eef7ff;
        margin: 1rem 0;
        border-radius: 0.5rem;
    }
</style>