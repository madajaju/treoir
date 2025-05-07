
class PartnerInfluence {
    static definition = {
        name: 'PartnerInfluence',
        description: 'How much influence a partner has in a region',
        attributes: {
            level: {
                type: 'string',
                description: 'Level of influence the partner has on the region',
            }
        },
        associations: {
            region: {
                type: 'Region',
                cardinality: 1,
                composition: false,
                owner: false,
            },
            partner: {
                type: 'Partner',
                cardinality: 1,
                composition: false,
                owner: false,
            },
        },
    }
}

module.exports = PartnerInfluence;

