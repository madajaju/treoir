<script>
    import AppHeader from './AppHeader.svelte';
    import AppSidebar from './AppSidebar.svelte';

    export let user; // User data passed to the layout
</script>

<div class="app-layout">
    <AppHeader />

    <div class="content-wrapper">
        <AppSidebar {user} />
        <main>
            <slot /> <!-- For route-specific content -->
        </main>
    </div>
</div>

<style>
    .app-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    .content-wrapper {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }
    main {
        flex-grow: 1;
        padding: 1rem;
        overflow-y: auto;
    }
</style>