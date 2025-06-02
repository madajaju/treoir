module.exports = {
    friendlyName: 'resume',
    description: 'Transition the task from Waiting to InProgress.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        if (obj.status !== 'Waiting') {
            throw new Error(`Cannot resume task '${obj.name}' from state '${obj.status}'`);
        }
        obj.status = 'InProgress';
        console.log(`Task '${obj.name}' resumed. Status: ${obj.status}`);
    }
};