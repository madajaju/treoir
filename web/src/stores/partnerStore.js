import { writable, get, derived } from "svelte/store";
import { Layer } from "../components/elements/Layer";
import { Element } from "../components/elements/Element";
import { Partner } from "../components/elements/Partner";

// Writable stores
export const currentPartner = writable(null);
export const partners = writable({}); // Ensure this is an object to match any assumptions in the derived stores

/**
 * Derived store to create partner nodes from the `partners` store.
 */
export const partnerNodes = derived(partners, ($partners) => {

    if (!$partners || Object.keys($partners).length === 0) {
        console.warn("partners store is empty or undefined.");
        return [];
    }

    const idMap = {};

    function processPartner(partner) {
        if (!partner || !partner.name || !partner.elements) {
            console.warn("Invalid partner object:", partner);
            return;
        }

        idMap[partner.name] = {
            ...partner,
            id: partner.name,
            name: partner.name,
            type: "Partner",
            _children: [],
            _view: Partner,
        };

        Object.entries(partner.elements).forEach(([_, element]) => {
            processElement(idMap[partner.name], element);
        });
    }

    function processElement(partner, element) {
        if (!partner || !element || !element.name || !element.layers) {
            console.warn("Invalid element:", element);
            return;
        }

        const id = `${partner.id}-${element.name}`;
        idMap[id] = {
            ...element,
            id,
            name: element.name,
            type: "Element",
            _children: [],
            _view: Element,
        };

        partner._children.push(idMap[id]);

        element.layers.forEach((layer) => processLayer(idMap[id], layer));
    }

    function processLayer(element, layer) {
        if (!layer) {
            console.warn("Invalid layer:", layer);
            return;
        }

        const id = `${element.id}-${layer}`;
        idMap[id] = {
            id,
            type: "Layer",
            name: layer,
            _view: Layer,
        };

        element._children.push(idMap[id]);
    }

    const result = [];
    Object.values($partners).forEach((partner) => {
        processPartner(partner);
        result.push(idMap[partner.name]);
    });

    return result;
});

/**
 * Fetches the current partner and updates the `currentPartner` store.
 */
export async function fetchCurrentPartner() {
    await fetchPartners(); // Ensure we have the latest partner data
    const partnerList = get(partners);
    const currentPartnerID = get(currentPartner)?.name;
    const currentPartnerFound = partnerList[currentPartnerID];
    if (currentPartnerFound) {
        currentPartner.set(currentPartnerFound);
    } else {
        console.error(`Current partner not found with id "${currentPartnerID}".`);
    }
}

/**
 * Fetches and updates all partners from the backend.
 */
export async function fetchPartners() {
    try {
        const response = await fetch(`/api/partner/list`);
        if (!response.ok) throw new Error("Failed to fetch partners from the server");

        const partnerObjects = await response.json();
        partners.set(partnerObjects || {}); // Always set `partners` to an object to avoid breaking assumptions
    } catch (error) {
        console.error("Error fetching partners:", error);
    }
}

/**
 * Updates the `currentPartner` store with a specific partner by ID.
 */
export async function setCurrentPartner(id) {
    await fetchPartners(); // Ensure the latest list of partners
    const partnerList = get(partners);

    const partnerFound = partnerList[id];
    if (partnerFound && partnerFound.name === id) {
        currentPartner.set(partnerFound);
    } else {
        console.error(`Partner with id "${id}" not found.`);
    }
}

/**
 * Derived store to process the current partner nodes.
 */
export const currentPartnerNodes = derived(currentPartner, ($currentPartner) => {
    if (!$currentPartner) {
        console.warn("currentPartner is null or undefined.");
        return [];
    }

    const idMap = {};

    function processPartner(partner) {
        if (!partner || !partner.name || !partner.elements) {
            console.warn("Invalid partner object in currentPartnerNodes:", partner);
            return;
        }

        idMap[partner.name] = {
            ...partner,
            id: partner.name,
            name: partner.name,
            type: "Partner",
            _children: [],
            _view: Partner,
        };

        Object.entries(partner.elements).forEach(([_, element]) => {
            processElement(idMap[partner.name], element);
        });
    }

    function processElement(partner, element) {
        if (!partner || !element || !element.name || !element.layers) {
            console.warn("Invalid element in currentPartnerNodes:", element);
            return;
        }

        const id = `${partner.id}-${element.name}`;
        idMap[id] = {
            ...element,
            id,
            name: element.name,
            type: "Element",
            _children: [],
            _view: Element,
        };

        partner._children.push(idMap[id]);

        element.layers.forEach((layer) => processLayer(idMap[id], layer));
    }

    function processLayer(element, layer) {
        if (!layer) {
            console.warn("Invalid layer in currentPartnerNodes:", layer);
            return;
        }

        const id = `${element.id}-${layer}`;
        idMap[id] = {
            id,
            type: "Layer",
            name: layer,
            _view: Layer
        };

        element._children.push(idMap[id]);
    }

    processPartner($currentPartner);

    const result = [idMap[$currentPartner.name]];
    return result;
});