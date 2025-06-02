<script>
    import MainView from "../components/MainView.svelte";
    import ResizableLayout from "../components/ResizableLayout.svelte";
    import WorkflowInstanceViewer from "./WorkflowInstanceViewer.svelte";
    import WorkflowInstanceRun from "./WorkflowInstanceRun.svelte";


</script>
<div class="bg-white p-4 rounded shadow" style="height: 100%;">
    <ResizableLayout
             LeftPanel= {{component: WorkflowInstanceViewer, props: {width: 400}}}
             ContentPanel= {{component: WorkflowInstanceRun, props: {}}}
     />
</div>
