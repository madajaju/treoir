
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
                type: "string",
                description: "Description of the customer"
            },
            color: {
                type: "string",
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
            }
        },
    }
}

module.exports = Customer;

