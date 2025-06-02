const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');

module.exports = {
    friendlyName: 'askAndMap',
    description: 'Ask AI to map elements from the partner to the elements from to the layers in the GEAR Architecture.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        prompt: {
            description: 'User prompt',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        partner: {
            description: 'Partner ID',
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
        let partner = inputs.partner || 'new';
        if(typeof partner === 'string') {
            partner = Partner.find({id: partner});
        }
        if(!partner) {
            partner = new Partner({id: partner, name: partner});
        }
        let systemPrompt = "You are a enterprise architect that is helping a partner map their current products and services to the GEAR Architecture. " +
            "The GEAR architecture is a " +
            "conceptual architecture that is used to capture and map current environments and identify gaps for the partners customers. " +
            "Use this architecture to help map the organization's products and services to customers across the GEAR architecture. Here are the high level layers: " +
            "organizational architecture, process, technology and physical hardware environments. If there is not a mapping do not create one, only map to the layers in the architecture. Here are the detail layers: "
        let layers = await Layer.instances();
        let layersJSON = {};
        for (let lname in layers) {
            if(!lname.includes('-')) {
                layersJSON[lname] = layers[lname].convertJSON({depth:2});
            }
        }
        let systemInfo = JSON.stringify(layersJSON);

        messages.push({
            role: 'system',
            content: systemPrompt,
        });
        messages.push({
            role: 'system',
            content: systemInfo,
        });

        messages.push({
            role: 'user',
            content: inputs.prompt,
        });
        let results = await AIHelper.ask(messages);
        if(env.res) {
            env.res.end(results);
        }

        await _mapElements(results, partner);
        return results;
    }
};

async function _mapElements(prompt, partner) {
    const elementJSON = `
        { 
            "name": "MyElementName", // Name of the product or service being offered by the partner
            "description": "Description on how the company uses the element."
            "layers": "LayerID from GEAR", // comma separate list of the layerids from the GEAR architecture.
        }`;
    let layers = await Layer.instances();
    let layersJSON = {};
    for (let lname in layers) {
        if(!lname.includes('-')) {
            layersJSON[lname] = layers[lname].convertJSON({depth:2});
        }
    }
    systemInfo = JSON.stringify(layersJSON);
        let messages = [];
    messages.push({
        role: 'system',
        content: 'The user prompt contains a textual analysis that I need to turn into suggestions to a mapping defined by JSON. ' +
            'Identify the elements in the architecture from this user prompt. An Element is a product or services offered by the partner to customers. Do not map internal elements. ' +
            `The layers of the GEAR architecture are ${systemInfo}. Create an array of JSON objects that strictly adhere to this JSON format: ${elementJSON}.
            Return only the array of JSON objects.`
    });
    messages.push({
        role: 'user',
        content: prompt,
    });

    let results = await AIHelper.askForCode(messages, 'JSON');
    for(let i in results) {
        // First look if the element exists
        let result = results[i];
        let elements = await Element.fuzzyFind({query: result.name, suppliers:[partner]});
        if(elements.length === 0) {
            let layers = result.layers.split(',');
            for(let i in layers) {
                result.layer = layers[i];
                result.partner = partner.id;
                let suggestion = new ElementSuggestion(result);
                partner.addToSuggestions(suggestion);
            }
        }
    }

    return results;
}