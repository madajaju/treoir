
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
            states: {
                type: 'State',
                description: 'States of the customer, current, future and any step-states to get from current to future.',
                cardinality: 'n',
                composition: true,
                owner: true,
            },
        },
    }
}

module.exports = Customer;

