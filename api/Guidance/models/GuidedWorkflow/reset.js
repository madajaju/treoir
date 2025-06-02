module.exports = {
    friendlyName: 'reset',
    description: 'Reset the workflow to its initial state.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {
        obj._attributes.status = 'initiated';
        for (let task of obj._associations.tasks || []) {
            task.status = 'pending'; // Assuming tasks have a status
        }
        console.log(`Workflow "${obj._attributes.name}" has been reset.`);
        return obj;
    }
};