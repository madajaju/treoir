module.exports = {
    friendlyName: 'moveToNextStage',
    description: 'Move the workflow to the next stage.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: function (obj, inputs, env) {
        let currentStageIndex = obj._attributes.currentStage || 0;

        if (currentStageIndex < obj._associations.stages.length - 1) {
            obj._attributes.currentStage = currentStageIndex + 1;
            console.log(`Moved to next stage: ${obj._associations.stages[currentStageIndex + 1]._attributes.name}`);
        } else {
            console.log('No more stages remain.');
            obj.complete();
        }
        return obj;
    }
};