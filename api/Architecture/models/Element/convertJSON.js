const fs = require('fs');
const Layer = require("./index");

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Element to JSON',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let retval = {};
        for(let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        retval.layers = [];
        for(let lname in obj.layers) {
            retval.layers.push(obj.layers[lname].id);
        }
        retval.partners = [];
        for(let pname in obj.partners) {
            retval.partners.push(obj.partners[pname].name);
        }
        return retval;
    }
};