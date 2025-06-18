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

    fn: async function (inputs, env) {
        let suggs = await Suggestion.instances();
        let retval = [];
        for(let i in suggs) {
            let value = suggs[i].convertJSON();
            retval.push(value);
        }
        return retval;
    }
};
