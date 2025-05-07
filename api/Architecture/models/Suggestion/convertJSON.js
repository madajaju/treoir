const fs = require('fs');
const Layer = require("./index");

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the suggestion to JSON',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
        depth: {
            type: 'number',
            description: 'Depth of the recursion',
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let retval = {};
        let depth = Number(inputs?.depth) || Infinity;
        for(let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        for(let aname in obj._associations) {
            let assoc = obj._associations[aname];
            if(obj.definition.associations[aname].cardinality === 1) {
                retval[aname] = { type: assoc.className, id: assoc.id };
            } else {
                retval[aname] = [];
                for(let i in assoc) {
                    retval[aname].push({ type: assoc[i].className, id:assoc[i].id});
                }
            }
        }
        retval.type = obj.definition.name;
        return retval;
    }
};
