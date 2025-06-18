
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
                type: "text",
                description: "Description of the partner."
            },
            color: {
                type: "color",
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
            regions: {
                type: 'PartnerInfluence',
                cardinality: 'n',
                composition: false,
            },
            suggestions: {
                type: 'Suggestion',
                cardinality: 'n',
                composition: true,
                owner: true,
            },
            assets: {
                type: 'Asset',
                cardinality: 'n',
                composition: true,
                owner: true,
                description: "Assets that are related to the partner."
            }
        },
    }
}

module.exports = Partner;

