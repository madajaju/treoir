const fs = require('fs');
const Layer = require("./index");

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Asset to JSON',
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
        return retval;
    }
};