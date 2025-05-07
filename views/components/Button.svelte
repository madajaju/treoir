<script>
    export let label = "Submit";
    export let onClick; // Callback for button click
    export let color = "blue"; // Primary color for button
</script>

<button on:click={onClick} style="background-color: {color}">
    {label}
</button>

<style>
    button {
        padding: 1rem;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-size: 1rem;
    }
</style>