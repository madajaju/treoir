module.exports = {
    friendlyName: 'reset',
    description: 'Reset the task to its Init state.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        obj.status = 'Init';
        console.log(`Task '${obj.name}' has been reset. Status: ${obj.status}`);
    }
};