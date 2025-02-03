const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Customer to JSON',
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
        retval.states = {};
        for(let sname in obj.states) {
            let state = obj.states[sname];
            retval.states[state.name] = state.convertJSON();
        }
        return retval;
    }
};