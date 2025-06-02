module.exports = {
    friendlyName: 'start',
    description: 'Transition the task from Ready to InProgress.',
    static: false, // This is an object-based method
    inputs: {},
    exits: {
        success: {}, // Successful transition
        failure: {}, // Invalid state
    },
    fn: function (obj, inputs, env) {
        console.log(`Task '${obj.name}' has started. Status: ${obj.state}`);
        setTimeout(() => {
            obj.complete();
        }, 100)
    }
};