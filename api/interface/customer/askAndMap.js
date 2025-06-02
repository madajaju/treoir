const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');

module.exports = {
    friendlyName: 'askAndMap',
    description: 'Ask AI to map engagements from the customer to the elements from to the layers in the GEAR Architecture.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        prompt: {
            description: 'User prompt',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        customer: {
            description: 'Customer ID',
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
        let customer = inputs.customer || 'new';
        if(typeof customer === 'string') {
            customer = Customer.find({name: customer});
        }
        if(!customer) {
            customer = new Customer({name: customer});
        }
        let systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
            " including people, process and technology to the GEAR Architecture. The GEAR architecture is a " +
            "conceptual architecture that is used to capture and map current environments and identify gaps. " +
            "The GEAR Architecture has the following layers. Use this architecture to help map the organization's " +
            "organizational architecture, process, technology and physical hardware environments. If there is not a mapping do not create one, only map the tools mentioned and not neccessarily what underlying elements are required to support the tools. Here are the layers: "
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

        await _mapElements(results, customer);
        console.log("Results:", results);
        return results;
    }
};

async function _mapElements(prompt, customer) {
    const elementJSON = `
        { 
            "name": "MyElementName", // Name of the tool, process, or service
            "suppliers": "MySupplierName", // Name of the supplier/vendor of the element, use Self if the customer has built the element themselves. Comma separate if more than one vendor for the element.
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
            'Identify the elements in the architecture from this user prompt. An Element is a tool, process, service or organizational construct. ' +
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
        let suppliers = await Supplier.fuzzyFind({query:result.suppliers});
        let elements = await Element.fuzzyFind({query: result.name, suppliers: suppliers});
        if(elements.length === 0) {
            let layers = result.layers.split(',');
            for(let i in layers) {
                result.layer = layers[i];
                let suggestion = new ElementSuggestion(result);
                customer.addToSuggestions(suggestion);
            }
        } else {
            for(let j in elements) {
                let element = elements[j];
                for (let k in element.layers) {
                    let layer = element.layers[k];
                    let sugg = new EngagementSuggestion({
                        name: result.name,
                        description: result.description,
                        element: element,
                        layer: layer
                    });
                    sugg.customer = customer;
                    customer.addToSuggestions(sugg);
                    console.log("Engagement suggestion created:", sugg.name);

                }
            }
        }
    }

    return results;
}