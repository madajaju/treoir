const fs = require('fs');

module.exports = {
    friendlyName: 'list',
    description: 'List all of the tasks',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (obj, inputs, env) {
        let tasks = await Task.instances();
        let retval = {};
        for(let name in tasks) {
            let task = tasks[name];
            retval[name] = task.convertJSON();
        }
        return retval;
    }
};
