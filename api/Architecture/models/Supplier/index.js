
class Supplier {
    static definition = {
        name: 'Supplier',
        description: 'This represents a supplier of a product or service. It should map to one of the partners in the GEAR. If not then the supplier is the customer themselves',
        attributes: {
            name: {
                type: 'string',
                description: 'The name of the supplier, e.g., Intel.'
            },
            contact: {
                type: 'string',
                description: 'The contact person at the supplier, e.g., Name of the contact at the supplier.'
            },
            description: {
                type: 'string',
                description: 'Description about the relationship, e.g., Any description about the relationship.'
            },
            details: {
                type: 'json',
                description: 'Details about the relationship, e.g., Any details about the relationship.'
            }
        },
        associations: {
            partner: {
                description: 'This represents the relationship between the customer and the partner.',
                type: 'Partner',
                cardinality: 1,
                composition: false,
                owner: false,
            },
            engagements: {
                description: 'This represents the engagements between the customer and the partner, i.e. the tools, processes, etc. that the partner provides to the customer.',
                type: 'Engagement',
                cardinality: 'n',
                composition: true,
                owner: true,
            }
        },
    }
}

module.exports = Supplier;

