const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Phase to JSON',
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
        retval.suppliers = {};
        for(let sname in obj.suppliers) {
            let supplier = obj.suppliers[sname];
            retval.suppliers[supplier.name] = supplier.convertJSON();
        }
        return retval;
    }
};