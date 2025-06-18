const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');
module.exports = {
    friendlyName: 'generate',
    description: 'Ask AI to Generate documentation for the customer from the user prompt.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        prompt: {
            description: 'User prompt',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        id: {
            description: 'Customer ID',
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
        let customer = inputs.id;
        if(typeof customer === 'string') {
            customer = Customer.find({id: customer});
        }
        if(!customer) {
            return "";
        }

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
        customer.details = results;
        if(env.res) {
            env.res.end(results);
        }
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
        if(suppliers.length === 0) {
            let supplier = new Supplier({name: result.suppliers});
            suppliers.push(supplier);
        }
        let elements = await Element.fuzzyFind({query: result.name, suppliers: suppliers});
        if(elements.length === 0) {
            // Ok there is not an element that exists for this tool in the system.
            // We should allow the user to create one and when they do an engagement will be created automatically.
            // The Supplier should be set accordingly.
            let layers = result.layers.split(',');
            for(let i in layers) {

                let layer = Layer.find({id: layers[i]});
                if(layer) {
                    let sugg = new EngagementSuggestion({
                        name: result.name,
                        description: result.description,
                        layer: layers[i],
                        supplier: suppliers[0]
                    });
                    sugg.customer = customer;
                    customer.addToSuggestions(sugg);
                    console.log("Engagement suggestion created:", sugg.name);
                }
            }
        } else {
            for (let j in elements) {
                let element = elements[j];
                for (let k in element.layers) {
                    let layer = element.layers[k];
                    let sugg = new EngagementSuggestion({
                        name: result.name,
                        description: result.description,
                        element: element,
                        layer: layer.name,
                        supplier: suppliers[0]
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