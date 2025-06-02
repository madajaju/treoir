<script>
    const baseDir = '../../../../../src';
    import { onMount } from "svelte";
    import { currentCustomer } from "../../../../../web/src/stores/customerStore.js"; // Assuming you have a store file where the customer is managed
    import CustomerSelector from "../components/CustomerSelector.svelte";
    import Mapper from "../components/Mapper.svelte";

    let currentCustomerData = null; // Local reference to track the customer

    const unsubscribe = currentCustomer.subscribe((value) => {
        currentCustomerData = value;
    })
    // Subscribe to the customer store to check if there is a customer
    onMount(() => {
        // Cleanup subscription when component is destroyed
        return () => unsubscribe();
    });
</script>
<div class="dashboard">
<!-- Conditional Rendering -->
{#if currentCustomerData}
    <!-- If a customer exists, show the Mapper component -->
    <Mapper />
{:else}
    <!-- If no customer exists, show the CustomerSelector component -->
    <CustomerSelector />
{/if}
</div>
<style>
    .dashboard {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }
</style>