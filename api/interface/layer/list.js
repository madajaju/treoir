const fs = require('fs');

module.exports = {
    friendlyName: 'show',
    description: 'Description of the method',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (obj, inputs, env) {
        let layers = await Layer.instances();
        let retval = {};
        for(let lname in layers) {
            if(!lname.includes('-')) {
                let subLayer = layers[lname];

                retval[lname] = subLayer.convertDJSON();
            }
        }
        return retval;
    }
};
