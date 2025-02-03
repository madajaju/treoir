
class Partner {
    static definition = {
        name: 'Partner',
        description: 'This represents the partner in the architecture.',
        attributes: {
            name: {
                type: 'string',
                description: 'Description of the partner.'
            },
            description: {
                type: "string",
                description: "Description of the partner."
            },
            color: {
                type: "string",
                description: "Color of the partner in the architecture."
            },
        },
        associations: {
            elements: {
                type: 'Element',
                cardinality: 'n',
                composition: false,
                owner: false,
            },
        },
    }
}

module.exports = Partner;

