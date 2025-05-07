<script>
    import MappingToGEAR from '../widgets/MappingToGEAR.svelte';
    import CustomerStateTracker from '../widgets/CustomerStateTracker.svelte';
    import RoadmapBuilder from '../widgets/RoadmapBuilder.svelte';

    let mapData = { /* Account Exec-specific mock map data */ };
    let customerStates = { current: "Legacy", next: "Modernized", future: "Cloud-Native" };
    let roadmap = [
        { milestone: "Initial Assessment", date: "2023-09-01" },
        { milestone: "Migrate to Cloud", date: "2024-01-01" },
    ];

    function saveMapping(updatedMap) {
        console.log("Saved mapping data:", updatedMap);
    }
</script>

<div class="dashboard-container">
    <h1>Account Exec Dashboard</h1>

    <section>
        <MappingToGEAR mapData={mapData} editable={true} onSave={saveMapping} />
    </section>

    <section>
        <CustomerStateTracker states={customerStates} />
    </section>

    <section>
        <RoadmapBuilder roadmap={roadmap} editable={true} />
    </section>
</div>

<style>
    .dashboard-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
</style>