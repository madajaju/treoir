module.exports = {
    friendlyName: 'create',
    description: 'Create a new customer',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        name: {
            description: 'Name of the Phase',
            type: 'string',
            required: true
        },
        description: {
            description: 'Description of the customer to create',
            type: 'string',
            required: false
        },
        color: {
            description: 'Color of the phase',
            type: 'string',
            required: false
        },
        targetDate: {
            description: 'Target date for the phase',
            type: 'string',
            required: false
        },
        kpis: {
            description: 'KPIs for the phase',
            type: 'json',
            required: false
        },
        customer: {
            description: 'The customer to create the phase for',
            type: 'string',
            required: true
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (inputs, env) {
        let customer = inputs.customer;
        if(typeof customer === 'string') {
            customer = new Customer.find(customer);
        }
        let details = {
            name: inputs.name,
            description: inputs.description || "TBD",
            color: inputs.color || "#4400ff",
            targetDate: inputs.targetDate || new Date(),
            kpis: inputs.kpis || "TBD",
        }
        customer.addToPhases(details);
        return customer;
    }
};
