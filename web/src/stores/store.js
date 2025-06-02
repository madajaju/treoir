import {derived, writable} from "svelte/store";
import {layers} from "./layerStore.js";

export const selectedNode = writable(null);
export const selectedValue = writable(null);
export const theme = writable("light");
export const graph = writable(null);
export const selectedRun = writable(null);
export const selectedClass = writable(null);
export const selectedCustomer = writable(null);
export const selectedPartner = writable(null);
export const selectedClassList = writable(null);
export const selectedNodeInfo = writable(null);