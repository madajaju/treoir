const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Engagement to JSON',
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
        if(obj.element) {
            retval.element = obj.element.name;
        }
        retval.layers = [];
        for(let sname in obj.layers) {
            let layer = obj.layers[sname];
            retval.layers.push(layer.id);
        }
        return retval;
    }
};