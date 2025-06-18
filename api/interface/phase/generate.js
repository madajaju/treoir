const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');

module.exports = {
    friendlyName: 'generate',
    description: 'Ask AI to Generate documentation for the phase from the user prompt.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        prompt: {
            description: 'User prompt',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        id: {
            description: 'phase ID',
            type: 'string',
            required: false,
        },
        target: {
            description: 'Target field',
            type: 'string',
            required: false,
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        }
    },

    fn: async function (inputs, env) {
        let messages = [];
        let phase = Phase.find({id:inputs.id});
        let systemPrompt = "Using the JSON that describes a company as a reference to answer the user prompt." +
            "The JSON is as follows: " + JSON.stringify(customer.convertJSON());
        messages.push({
            role: 'system',
            content: systemPrompt,
        });
        if(!inputs.prompt) {
            inputs.prompt = "Generate a description of the company."
        }
            messages.push({
                role: 'user',
                content: inputs.prompt,
            });

        let results = await AIHelper.ask(messages);
        phase.details = results;
        if(env.res) {
            env.res.end(results);
        }
    }
};