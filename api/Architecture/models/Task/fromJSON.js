const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        tasks: {
            description: 'Tasks in a JSON format',
            type: 'json',
            required: true
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        let tasks = inputs.tasks;
        let retval = {};
        for (let name in tasks) {
            let task = tasks[name];

            let taskObj = Task.find(name);
            if (!taskObj) {
                taskObj = new Task({id: task.name, name: task.name});
            }
            taskObj.name = task.name;
            taskObj.details = task.details;
            taskObj.status = task.status;
            taskObj.save();
            retval[name] = taskObj;
        }
        return retval;
    }
};
