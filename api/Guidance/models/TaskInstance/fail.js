module.exports = {
    friendlyName: 'fail',
    description: 'Transition the task to Failed from any valid state.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        if (obj.status === 'Completed') {
            throw new Error(`Cannot fail a completed task '${obj.name}'`);
        }
        obj.status = 'Failed';
        console.log(`Task '${obj.name}' has failed. Status: ${obj.status}`);
    }
};