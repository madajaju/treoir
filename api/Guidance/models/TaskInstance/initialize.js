module.exports = {
    friendlyName: 'initialize',
    description: 'Transition the task from Init to Ready.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {

        console.log(`Task '${obj.name}' initialized. Status: ${obj.state}`);
    }
};