const fs = require('fs');

module.exports = {
    friendlyName: 'accept',
    description: 'Accept the Suggestion for the context provided.',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
        context: {
            type: 'ref',
            required: true,
            description: 'The context to accept the ElementSuggestion for.'
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        return obj;
    }
};
