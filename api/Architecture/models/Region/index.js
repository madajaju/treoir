
class Region {
    static definition = {
        name: 'Region',
        description: 'Region that partner operates',
        attributes: {
            name: {
                type: 'string',
                description: 'The Name of the region',
            }
        },
        associations: {
            partners: {
                type: 'PartnerInfluence',
                cardinality: 'n',
                composition: false,
                owner: false,
            },
        },
    }
}

module.exports = Region;

