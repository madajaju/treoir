const fs = require('fs');

module.exports = {
    friendlyName: 'list',
    description: 'List all of the suggestions',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (obj, inputs, env) {
        let suggs = await Suggestion.instances();
        let retval = {};
        for(let name in suggs) {
            let sugg = suggs[name];
            retval[name] = sugg;
        }
        return retval;
    }
};
