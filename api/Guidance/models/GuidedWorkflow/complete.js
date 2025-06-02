module.exports = {
    friendlyName: 'complete',
    description: 'Mark the workflow as completed.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {
        obj._attributes.status = 'completed';
        console.log(`Workflow "${obj._attributes.name}" has been completed.`);
        return obj;
    }
};