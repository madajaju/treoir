module.exports = {
    friendlyName: 'start',
    description: 'Initialize the workflow, setting its status to initiated.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {

        if (!obj.stages || obj.stages.length === 0) {
            throw new Error('Cannot start workflow. No stages defined.');
        }

        // Initialize the first stage
        obj.currentStage = 0; // Set the first stage as the current stage
        const firstStage = obj.stages[obj.currentStage];
        firstStage.start();
        console.log(`Workflow "${obj._attributes.name}" has been started.`);
        return obj;
    }
};