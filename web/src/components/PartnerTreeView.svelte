<script>
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";
  import TreeView from "./TreeView.svelte";
  import { fetchPartners, currentPartnerNodes } from "../stores/partnerStore.js";

  // Automatically derive `topLevelNodesStore` from `currentPartnerNodes`
  let topLevelNodesStore = derived(currentPartnerNodes, ($currentPartnerNodes) => $currentPartnerNodes);

  $: nodes = $topLevelNodesStore;

  // Fetch initially
  onMount(fetchPartners);
</script>

<TreeView {nodes} title="Partner" />