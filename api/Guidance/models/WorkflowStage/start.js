module.exports = {
    friendlyName: 'start',
    description: 'Initialize the stage, setting its status to initiated.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {

        // Get
        obj.tasks.forEach((task) => {
            task.initialize();
        });
        obj.tasks[0].start();

        return obj;
    }
};