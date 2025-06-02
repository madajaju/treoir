module.exports = {
    friendlyName: 'complete',
    description: 'Transition the task from InProgress to Completed.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        console.log(`Task '${obj.name}' completed successfully. Status: ${obj.state}`);
    }
};