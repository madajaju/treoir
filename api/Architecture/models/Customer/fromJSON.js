const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        customer: {
            description: 'Customer in a JSON format',
            type: 'json',
            required: true
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        let customer = inputs.customer;
        let customerObj = Customer.find(customer.name);
        if (!customerObj) {
            customerObj = new Customer({id: customer.name, name: customer.name});
        }
        customerObj.name = customer.name;
        customerObj.description = customer.description;
        customerObj.color = customer.color;
        customerObj.details = customer.details;
        customerObj.save();
        for (let sname in customer.states) {
            let state = State.fromJSON({state: customer.states[sname]});
            state.save();
            customerObj.addToStates(state);
            customerObj.save();
        }
        return customerObj;
    }
};
