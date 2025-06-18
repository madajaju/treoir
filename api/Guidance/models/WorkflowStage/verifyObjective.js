const AIHelper = require('ailtire/src/Server/AIHelper');

module.exports = {
    friendlyName: 'verifyObjective',
    description: 'Verify that the objective has been satisfied.',
    static: false, // Instance-based method
    inputs: {},

    exits: {},

    fn: async function (obj, inputs, env) {
        // Get the next Task to work on.

        //Get the context of the stage. Turn it into a string.
        // Now check the objective based on  the objective.
        let inputString = JSON.stringify(obj.inputs);
        let messages = [
            {
                role: 'system',
                content: `Before a a stage can be completed, it must be verified that ${obj.objective}.
                The inputs  to the stage are: ${inputString}. Evaluate the user prompt to see if it met the objective of the  stage.
                If it does then return true. Otherwise return a list of tasks to help satisfy the objectives.`
            },
            {
                role: 'user',
                content: JSON.stringify(obj.context),
            }
        ];
        let results = await AIHelper.ask(messages);

        console.log(results);
        return true;
    }
};