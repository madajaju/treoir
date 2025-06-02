
class Engagement {
    static definition = {
        name: 'Engagement',
        description: "This is a mapping from the customer to the elements provided by the supplier and to the layers of the architecture.",
        attributes: {
            name: {
                type: 'string',
                description: 'The name of the engagement, such as Laptops.'
            },
            description: {
                type: 'string',
                description: 'A description of the engagement, e.g., Using laptops.'
            },
            details: {
                type: 'json',
                description: 'Details about the engagement, e.g.,'
            }
        },
        associations: {
            supplier: {
                type: 'Supplier',
                cardinality: 1,
                composition: false,
                owner: false,
            },
            element: {
                type: 'Element',
                cardinality: 1,
                composition: false,
                owner: false,
            },
            layers: {
                type: 'Layer',
                unique: true,
                cardinality: 'n',
                composition: false,
                owner: false,
            },
            assets: {
                type: 'Asset',
                cardinality: 'n',
                composition: true,
                owner: true,
                description: "Assets that are related to the engagement."
            }
        },
    }
}

module.exports = Engagement;

