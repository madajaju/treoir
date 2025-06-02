import {writable, get, derived} from "svelte/store";
import {Layer} from "../components/elements/Layer";
import fs from 'fs';
import {API_BASE_URL} from "../config.js";

// The main store to hold the entire architecture
export const layers = writable({});
export const layerNodes = derived(layers, ($layers) => {
    const idMap = {};
    const rootNodes = [];

    function mapLayer(parent, layer) {
			let id = parent ? parent.id + '-' + layer.name : layer.name;
			idMap[id] = {
				...layer,
				id: id,
				type: 'Layer',
				_children: [],
				_view: Layer
			};
			if (parent) {
				idMap[id].parent = parent;
				parent._children.push(idMap[id]);
			}
			for (let cname in layer.layers) {
				layer.layers[cname].name = layer.layers[cname].name || cname;
				mapLayer(idMap[id], layer.layers[cname]);
			}
			return idMap[layer.name];
		}
    for (let lname in $layers) {
        let layer = $layers[lname];
        layer.name = layer.name || lname;
        rootNodes.push(mapLayer(null, layer));
    }

    return rootNodes;
});

// Fetch the architecture from the backend REST API
// layerStore.js
export async function fetchLayers() {
    try {
        // Fetch the hosted JSON file
        const response = await fetch(`${API_BASE_URL}/layer/list`); // Update with your hosting URL if necessary
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const layerObjects = await response.json();
        layers.set(layerObjects); // Set the store value with the parsed JSON data
    } catch (error) {
        console.error('Error fetching layers:', error);
    }
}

export function getLayer(layerID) {
    let myLayers = get(layerNodes);
    return findLayer(myLayers, layerID);
    function findLayer(myLayers, layerID) {
        for (let lname in myLayers) {
            let layer = myLayers[lname];
            if (layer.name === layerID || layer.id === layerID) return layer;
            if (layer._children) {
                const childLayer = findLayer(layer._children, layerID);
                if (childLayer) return childLayer;
            }
        }
        return null;
    }
}