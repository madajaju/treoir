const fs = require('fs');

module.exports = {
    friendlyName: 'show',
    description: 'Description of the method',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        attr1: {
            description: 'Description for the parameter',
            type: 'string', // string|boolean|number|json
            required: false
        },
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (obj, inputs, env) {
        let partners = await Partner.instances();
        let retval = {};
        for(let i in partners) {
            let partner = partners[i];
            retval[partner.name] = partner.convertDJSON();
        }
        return retval;
    }
};
