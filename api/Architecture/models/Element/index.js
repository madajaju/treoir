
class Element {
    static definition = {
        name: 'Element',
        description: 'This represents a element in the architecture it could be software, service, process, device etc...',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the element'
            },
            description: {
                type: "string",
                description: "Description of the element. This gives more details about the element in the architecture.",
            },
            color: {
                type: "string",
                description: "Color of the element in the architecture."
            }
        },
        associations: {
            partners: {
                type: 'Partner',
                cardinality: 'n',
                composition: false,
                owner: false,
                description: "Partners that the element is provided by."
            },
            layers: {
                type: "Layer",
                cardinality: 'n',
                composition: false,
                owner: false,
                description: "Layers that the element is in."
            },
            assets: {
                type: "Asset",
                cardinality: 'n',
                composition: true,
                owner: true,
                description: "Assets that are related to the element."
            }
        },
    }
}

module.exports = Element;

