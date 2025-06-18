const fs = require('fs');

module.exports = {
    friendlyName: 'suggestions',
    description: 'List all of the suggestions for the customer',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            type: 'string',
            required: true,
            description: 'The id of the customer'
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let customer = Customer.find(inputs.id);
        if(!customer) {
            return {status: 404, message: `Customer ${inputs.id} not found`};
        }
        let suggs = customer.suggestions;
        let retval = [];
        for(let i in suggs) {
            let value = suggs[i].convertJSON();
            retval.push(value);
        }
        return retval;
    }
};
