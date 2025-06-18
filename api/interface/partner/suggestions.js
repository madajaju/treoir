const fs = require('fs');

module.exports = {
    friendlyName: 'suggestions',
    description: 'List all of the suggestions for the partner',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            type: 'string',
            required: true,
            description: 'The id of the partner'
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let partner = Partner.find(inputs.id);
        if(!partner) {
            return {status: 404, message: `Partner ${inputs.id} not found`};
        }
        let suggs = partner.suggestions;
        let retval = [];
        for(let i in suggs) {
            let value = suggs[i].convertJSON();
            retval.push(value);
        }
        return retval;
    }
};
