const fs = require('fs');
const AClass = require('ailtire/src/Server/AClass');
const AIHelper = require('ailtire/src/Server/AIHelper.js');

module.exports = {
    friendlyName: 'refine',
    description: 'Refine the suggestion to include deeper layers of the GEAR',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            type: 'string',
            required: true,
            description: 'The id of the suggestion'
        },
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: async function (inputs, env) {
        let sugg = Suggestion.find(inputs.id);
        // Now get out of the sugg the element and add that to the customer.
        let results = await _askAI(sugg);
        for(let  i in results){
            let result = results[i];
            if(result !== sugg.layer) {
                let newSugg = new ElementSuggestion({name:sugg.name, description:sugg.description, layer:result, suppliers: sugg.suppliers})
                console.log("Created new Suggestion:", newSugg.name );
            }
        }
    }
};

async function _askAI(sugg, layerjson) {
    if(sugg.layer) {
        let layer = Layer.find(sugg.layer);
        const layerJSON = layer.convertJSON({depth:3})
        const systemInfo = JSON.stringify(layerJSON);
        let systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
            "A higher level layer was chosen to map the element. Your job is select one or more sublayers or to keep the current layer." +
            `The original layer selected has the following sub-layers ${systemInfo}. ` +
            `If there is a more accurate sub-layer return it. If not then return the current layer. ` +
            `Return the JSON Array results based on the User Prompt.`
        let userPrompt = `I need to evaluate the following for a more detailed layer. The Element is ${sugg.name} - ${sugg.description}. It is currently mapped to layer: ${sugg.layer}`;
        let results = await AIHelper.ask([
            { role: 'system', content: systemInfo },
            { role: 'user', content: userPrompt }
        ]);
        let evalPrompt = `Identify the sub-layers that are in the text and create a JSON Array that contains the id of the sublayers ["sublayerid1", "sublayer2"] that has just the sublayer names. Use the following as the list of sub-layers to use. ${systemInfo}`
        let resultCode = await AIHelper.askForCode([
            { role: 'system', content: evalPrompt },
            { role: 'user', content: results }
        ]);
        return resultCode;
    }
    return null;
}