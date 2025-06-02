module.exports = {
    friendlyName: 'wait',
    description: 'Transition the task from InProgress to Waiting.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        return obj;
    }
};