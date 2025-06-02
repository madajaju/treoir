module.exports = {
    friendlyName: 'failedStage',
    description: 'A Stage has failed.',
    static: false, // Instance-based method
    inputs: {
        stage: {
            type: 'ref',
            required: true,
            description: 'The stage that failed.'
        }
    },

    exits: {},

    fn: function (obj, inputs, env) {
        obj._attributes.status = 'completed';
        console.log(`Workflow "${obj._attributes.name}" has been completed.`);
        return obj;
    }
};