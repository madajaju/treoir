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
        retval.phases = {};
        for(let sname in obj.phases) {
            let phase = obj.phases[sname];
            retval.phases[phase.name] = phase.convertDJSON();
        }
        retval.suggestions = [];
        for(let sname in obj.suggestions) {
            let sugg = obj.suggestions[sname];
            retval.suggestions.push(sugg.convertDJSON());
        }
        retval._type = "Customer";
        return retval;
    }
};