import {writable, get, derived} from "svelte/store";
import {Layer} from "../components/elements/Layer";
import {Customer} from "../components/elements/Customer";
import {currentPartner} from "./partnerStore.js";

// The main store to hold the entire architecture
export const currentCustomer = writable(null);
export const customers = writable({});
export const customerExport = writable(null);
export const customerLayers = derived(customers, ($customers) => {
	const idMap = {};
	function processCustomer(customer) {
		for (let cname in customer.phases) {
			processState(customer, customer.phases[cname]);
		}
	}

	function processState(customer, phase) {
		let id = customer.name + '-' + phase.name;
		for(let sname in phase.suppliers) {
			processSupplier(customer, phase, phase.suppliers[sname]);
		}
	}
	function mapSupplier(customer, phase, supplier) {
		for(let sname in supplier.engagements) {
			mapEngagement(customer, phase, supplier, supplier.engagements[sname]);
		}
	}

	function mapEngagement(customer,phase,supplier,engagement) {
		for(let i in supplier.layers) {
			let layerID =supplier.layers[i];
			if(!idMap.hasOwnProperty(layerID)) {
					idMap[layerID] = {
						id: layerID,
						type: "Layer",
						_engagements: [],
					}
			}
			idMap[layerID]._engagements.push({
				phase: phase,
				engagement: engagement,
				customer: customer,
				supplier: supplier
			});
		}
	}
	mapCustomer($customers);
	return idMap;
});

let idMap = {};
export const customerNodes = derived(customers, ($customers) => {
    idMap = {};
    const rootNodes = [];

	rootNodes.push(mapCustomer($customers));
    return rootNodes;
});

export const currentCustomerNodes = derived(currentCustomer, ($currentCustomer) => {
	idMap = {};
	const rootNodes = [];

	rootNodes.push(mapCustomer($currentCustomer));
	return rootNodes;
});

export async function fetchCurrentCustomer() {
	await fetchCustomers();
	const customerList = get(customers);
	if(currentCustomer) {
		const customerID = get(currentCustomer).id;
		const customerFound = customerList[customerID];
		if (customerFound && customerFound.id === customerID) {
			currentCustomer.set(customerFound);
		} else {
			console.error(`Customer not found with ${customerID}`);
		}
	}
}
// Fetch the architecture from the backend REST API
// layerStore.js
export async function fetchCustomers() {
    try {
        // Fetch the hosted JSON file
        const response = await fetch(`/api/customer/list`); // Update with your hosting URL if necessary
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const customerObjects = await response.json();
        customers.set(customerObjects); // Set the store value with the parsed JSON data
    } catch (error) {
        console.error('Error fetching layers:', error);
    }
}

export async function setCurrentCustomer(id) {
	await fetchCustomers();
	const customerList = get(customers);
	const customerFound = customerList[id];
	if(customerFound && customerFound.id === id) {
		currentCustomer.set(customerFound);
	} else {
		console.error(`Customer not found with ${id}`);
	}
}

export function getLayer(layerID) {
    let myLayers = get(layerNodes);
    return findLayer(myLayers, layerID);
    function findLayer(myLayers, layerID) {
        for (let lname in myLayers) {
            let layer = myLayers[lname];
            if (layer.name === layerID) return layer;
            if (layer._children) {
                const childLayer = findLayer(layer._children, layerID);
                if (childLayer) return childLayer;
            }
        }
        return null;
    }
}

function mapCustomer(customer) {
	idMap[customer.name] = {
		...customer,
		id: customer.name,
		type: "Customer",
		_children: [],
		_view: Customer,
	};
	for (let cname in customer.phases) {
		mapState(idMap[customer.name], customer.phases[cname]);
	}
	return idMap[customer.name];
}

function mapState(customer, phase) {
	let id = customer.name + '-' + phase.name;
	idMap[id] = {
		...phase,
		id: id,
		type: "State",
		_children: [],
		_view: Element,
	}
	customer._children.push(idMap[id]);
	for(let sname in phase.suppliers) {
		mapSupplier(idMap[id], phase.suppliers[sname]);
	}
}
function mapSupplier(phase, supplier) {
	let id = phase.id + '-' + phase.name;
	idMap[id] = {
		...supplier,
		id: id,
		type: "Supplier",
		_children: [],
		_view: Element,
	}
	phase._children.push(idMap[id]);
	for(let sname in supplier.engagements) {
		mapEngagement(idMap[id], supplier.engagements[sname]);
	}
}

function mapEngagement(supplier,engagement) {
	let id = supplier.id + '-' + engagement.name;
	idMap[id] = {
		...engagement,
		id: id,
		type: "Engagement",
		_view: Element,
	}
	supplier._children.push(idMap[id]);
}
