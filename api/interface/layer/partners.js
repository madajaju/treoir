const fs = require('fs');
const {description} = require("./list");

module.exports = {
    friendlyName: 'partners',
    description: 'Partners for the layer specified',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            description: 'Layer to get partners for',
            type: 'string', // string|boolean|number|json
            required: true
        },
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let layer = inputs.id;
        if(!layer) {
            console.log(inputs);
            return;
        }
        layer = Layer.find(layer);
        let retval = {};
        let partners = await Partner.instances();
        for(let i in partners) {
            let partner = partners[i];
            for(let j in partner.elements) {
                let element = partner.elements[j];
                for(let k in element.layers) {
                    if (element.layers[k].id.includes(layer.id)) {
                        if (!retval.hasOwnProperty(partner.name)) {
                            retval[partner.name] = {
                                elements: {},
                                name: partner.name,
                                description: partner.description,
                                color: partner.color
                            };
                        }
                        retval[partner.name].elements[element.name] = element.convertJSON();
                    }
                }
            }
        }
        return retval;
    }
};
