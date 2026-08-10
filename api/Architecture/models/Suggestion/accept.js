const fs = require('fs');

module.exports = {
    friendlyName: 'accept',
    description: 'Accept the suggestion.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        owner: {
            description: 'owner of the element',
            type: 'string',
            required: true
        },
        element: {
            description: 'element in a JSON format',
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
        obj.context;

        return sugObj;
    }
};
