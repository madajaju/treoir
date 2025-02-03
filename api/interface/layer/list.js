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

                retval[lname] = subLayer.convertJSON();
            }
        }
        return retval;
        /*
        let gearStr =  fs.readFileSync('./gear.json', 'utf-8');
        try {
            let gear = JSON.parse(gearStr);
            return gear;
        }
        catch(e) {
            console.error("Gear.json parse error!", e);
        }

         */
    }
};
