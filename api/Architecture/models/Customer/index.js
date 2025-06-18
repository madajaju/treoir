
class Customer {
    static definition = {
        name: 'Customer',
        description: 'This is a customer of the system.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the customer',
            },
            description: {
                type: "text",
                description: "Description of the customer"
            },
            color: {
                type: "color",
                description: "Color of the customer in the architecture."
            },
            details: {
                type: "json",
                description: "Details of the customer"
            }
        },
        associations: {
            phases: {
                type: 'Phase',
                description: 'Phases of the customer, current, future and any step-phases to get from current to future.',
                cardinality: 'n',
                composition: true,
                owner: true,
            },
            suggestions: {
                type: 'Suggestion',
                cardinality: 'n',
                composition: true,
                description: 'Suggestions made by the AI to create elements or engagements.',
            },
            assets: {
                type: 'Asset',
                cardinality: 'n',
                composition: true,
                description: 'Assets that are related to the customer.',
                owner: true,
            }
        },
    }
}

module.exports = Customer;

