<script>
    import '../../../../../web/src/app.css';

    let { children } = $props();

    import { onMount } from "svelte";
    import ArchitectureTreeView from "../../../../../web/src/components/ArchitectureTreeView.svelte";
    import PartnersTreeView from "../../../../../web/src/components/PartnersTreeView.svelte";
    import MainView from "../../../../../web/src/components/MainView.svelte";
    import ResizableLayout from "../../../../../web/src/components/ResizableLayout.svelte";

    import { selectedNode, theme, selectedCustomer } from "../../../../../web/src/stores/store.js";
    import {partnerNodes, partners, fetchPartners} from "../../../../../web/src/stores/partnerStore.js";

    let myPartnerNodes = null;
    const unsubscribe = partnerNodes.subscribe((value) => {
        console.log("Partner nodes changed: ", value);
        myPartnerNodes = value;
    })
    // Subscribe to the customer store to check if there is a customer
    onMount(() => {
        document.documentElement.setAttribute("data-theme", $theme);
        fetchPartners();
        return () => unsubscribe();
    });

    function changeTheme(newTheme) {
        theme.set(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }
</script>

<div class="flex flex-col h-screen w-full top-page">
    <!-- HEADER -->
    <header class="bg-primary text-white p-4 flex items-center justify-between header">
        <h1 class="text-xl font-bold">Architecture Explorer</h1>
    </header>
    <main class="main-content">

        <ResizableLayout
                LeftPanel={{component: ArchitectureTreeView, props: {selectedNode}}}
                ContentPanel={{component:MainView, props: {}}}
                RightPanel={{component:PartnersTreeView, props:{}}}
        />
    </main>
    <!-- FOOTER -->
    <footer class="bg-base-200 p-2 text-center text-sm footer" >
        <span>System Status: <strong>Online</strong></span>
    </footer>
</div>

<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    .header {
        height: 50px;
        background-color: #000000;
        display: flex;
    }
    .footer {
        height: 40px;
        display: flex;
    }
    .top-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
    .main-content {
        flex-grow: 1;
        overflow: auto;
    }
</style>