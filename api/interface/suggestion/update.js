const fs = require('fs');
const AClass = require('ailtire/src/Server/AClass');

module.exports = {
    friendlyName: 'update',
    description: 'Update the suggestion with the fields',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            type: 'string',
            required: true,
            description: 'The id of the suggestion'
        },
        name: {
            type: 'string',
            required: false,
            description: 'The name of the suggestion'
        },
        description: {
            type: 'string',
            required: false,
            description: 'The description of the suggestion'
        },
        layer: {
            type: 'string',
            required: false,
            description: 'The layer of the suggestion'
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let sugg = Suggestion.find(inputs.id);
        // Now get out of the sugg the element and add that to the customer.
        if(inputs.name) {
            sugg.name = inputs.name;
        }
        if(inputs.description) {
            sugg.description = inputs.description;
        }
        if(inputs.layer) {
            sugg.layer = inputs.layer;
        }
        sugg._state = "Edited";
        sugg.state = "Edited";
        return sugg;
    }
};
