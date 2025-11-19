<script>
    const baseDir = '../../../../../src';
    import { onMount } from "svelte";
    import { currentPartner } from "../../../../../web/src/stores/partnerStore.js"; // Assuming you have a store file where the customer is managed
    import PartnerSelector from "../components/PartnerSelector.svelte";
    import Mapper from "../components/Mapper.svelte";

    let currentPartnerData = null; // Local reference to track the customer

    const unsubscribe = currentPartner.subscribe((value) => {
        currentPartnerData = value;
    })
    // Subscribe to the customer store to check if there is a customer
    onMount(() => {
        // Cleanup subscription when component is destroyed
        return () => unsubscribe();
    });
</script>

<Mapper />