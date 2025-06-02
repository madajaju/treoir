module.exports = {
    friendlyName: 'completeTask',
    description: 'Initialize the stage, setting its status to initiated.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {
        // Get the next Task to work on.
        obj.tasks.forEach((task) => {
            if(task.state === 'Ready') {
                task.start();
                return obj;
            }
        });

        // If you are here then all of the tasks have completed.
        // Now check that the objective has been met.
        if(obj.verifyObjective()) {
            obj.complete();
        } else {
            // The verifyObjective will create new tasks to help satisfy the objective. Start them off.
            obj.tasks.forEach((task) => {
                if(task.state === 'Ready') {
                    task.start();
                    return obj;
                }
            });
        }
        return obj;
    }
};