<script>
    export let menu = [];
    import { selectedNode } from "../stores/store.js";
    import ResizableLayout from "./ResizableLayout.svelte";
    import MetadataDetail from "./MetadataDetail.svelte";
    import DetailView from "./DetailView.svelte";
    import GraphView from "./GraphView.svelte";
    import DocumentationView from "./DocumentationView.svelte";
    import Menu from "./Menu.svelte";
    import GenAIView from "./GenAIView.svelte";
    import GenAISuggestionView from "./GenAISuggestionView.svelte";
    import {Layer} from "./elements/Layer/index.js";

    let currentView = "Graph";

    function showGraphView() {
        currentView = "Graph";
    }
    function showDocumentationView() {
        currentView = "Documentation";
    }

    function showGenAIPanel() {
        currentView = "GenAI";
    }

        $: myPanel =
            currentView === "Graph"
                ? { component: GraphView, props: { id: "mainWindow", currentView, defaultView: Layer } }
            : currentView === "Documentation"
                ? { component: DocumentationView, props: { id: "mainWindow", currentView } }
                : { component: GenAIView, props: { id: "mainWindow", currentView } }; // Default to GenAIView if no match


    let menuItems = [
        { label: 'Graph', action: () => { showGraphView(); } },
        { label: 'Edit', action: () => { showDocumentationView(); } },
        { label: 'Todo', action: () => {console.log('TODO')} },
    ];
    if(menu) {
        menuItems.push(...menu);
    }
    function handleMenuClick(item) {
        // Handle menu click logic, e.g., navigation
        console.log('Selected Menu Item:', item);
    }
</script>

<Menu {menuItems} {handleMenuClick} />
<div class="flex items-center justify-center h-full bg-gray-100 rounded">
    <ResizableLayout
            TopPanel={{ component: DetailView, props: { id: "preview", height: 200 } }}
            ContentPanel = {myPanel}
            BottomPanel = {{component: GenAISuggestionView, props: { id:'genai', height: 300}}}
    />
</div>
