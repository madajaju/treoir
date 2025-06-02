module.exports = {
    friendlyName: 'complete',
    description: 'Mark the workflow as completed.',
    static: false, // Instance-based method
    inputs: {
        stage: {
            type: 'ref',
            required: true,
            description: 'The stage that completed.'
        }
    },

    exits: {},

    fn: function (obj, inputs, env) {
        obj.moveToNextStage();
        return obj;
    }
};