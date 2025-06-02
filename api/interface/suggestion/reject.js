const fs = require('fs');
const AClass = require('ailtire/src/Server/AClass');

module.exports = {
    friendlyName: 'accept',
    description: 'Accept the suggestion by adding it to the context',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            type: 'string',
            required: true,
            description: 'The id of the suggestion'
        },
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let sugg = Suggestion.find(inputs.id);
        // Now get out of the sugg the element and add that to the customer.
        sugg.reject(inputs);
        return sugg;
    }
};
