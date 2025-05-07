const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');

module.exports = {
    friendlyName: 'askAndMap',
    description: 'Ask AI something and map elements from to the layers in the GEAR Architecture.',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        prompt: {
            description: 'User prompt',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        context: {
            description: 'Context of the prompt',
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
        let context = inputs.context || ':';
        let  systemPrompt= "";
        let systemInfo = "";
        let event = context.split(':')[0];
        switch (event) {
            case 'Layer': {
                    let [event, layerName] = context.split(':');
                    systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
                        " including people, process and technology to the GEAR Architecture. The GEAR architecture is a " +
                        "conceptual architecture that is used to capture and map current environments and identify gaps. " +
                        "The GEAR Architecture is has the following layers. Use this architecture to help map the organization's " +
                        "organizational architecture, process, technology and physical hardware environments. Here are the layers: "
                    let layer = await Layer.find(layerName)
                    let layersJSON = layer.convertJSON();
                    systemInfo = JSON.stringify(layersJSON);
                }
                break;
            case 'Element': {
                    let [event, elementName] = context.split(':');
                    systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
                        " including people, process and technology to the GEAR Architecture. The GEAR architecture is a " +
                        "conceptual architecture that is used to capture and map current environments and identify gaps. " +
                        "The GEAR Architecture is has the following layers. Use this architecture to help map the organization's " +
                        "organizational architecture, process, technology and physical hardware environments. Here are the layers: "
                    let element = await Element.find(elementName);
                    let elementJSON = element.convertJSON();
                    systemInfo = JSON.stringify(elementJSON);
                }
                break;
            case 'Partner': {
                    let [event, partnerName] = context.split(':');
                    systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
                        " including people, process and technology to the GEAR Architecture. The GEAR architecture is a " +
                        "conceptual architecture that is used to capture and map current environments and identify gaps. " +
                        "The GEAR Architecture is has the following layers. Use this architecture to help map the organization's " +
                        "organizational architecture, process, technology and physical hardware environments. Here are the layers: "
                    if(partnerName) {
                        let partner = await Partner.find(partnerName);
                        let partnerJSON = partner.convertJSON();
                        systemInfo = JSON.stringify(partnerJSON);
                    } else {
                        let partners = await Partner.instances();
                        let partnerJSON = {};
                        for (let pname in partners) {
                            partnerJSON[pname] = partners[pname].convertJSON();
                        }
                        systemInfo = JSON.stringify(partnerJSON);
                    }
                }
                break;
            case 'Customer': {
                    let [event, customerName] = context.split(':');
                    systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
                        " including people, process and technology to the GEAR Architecture. The GEAR architecture is a " +
                        "conceptual architecture that is used to capture and map current environments and identify gaps. " +
                        "The GEAR Architecture is has the following layers. Use this architecture to help map the organization's " +
                        "organizational architecture, process, technology and physical hardware environments. If there is not a mapping do not create one, only map the tools mentioned and not neccessarily what underlying elements are required to support the tools. Here are the layers: "
                    if(customerName) {
                        let customer = await Customer.find(customerName);
                        let customerJSON = customer.convertJSON();
                        systemInfo = JSON.stringify(customerJSON);
                    } else {
                        let customers = await Customer.instances();
                        let customerJSON = {};
                        for (let cname in customers) {
                            customerJSON[cname] = customers[cname].convertJSON();
                        }
                        systemInfo = JSON.stringify(customerJSON);
                    }
                }
                break;
            default:
                systemPrompt = "You are a enterprise architect that is helping an organization map their current environment" +
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
                systemInfo = JSON.stringify(layersJSON);
                break;

        }
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

        await _mapElements(results);
        return results;
    }
};

async function _mapElements(prompt) {
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
        let elements = await Element.fuzzyFind({query: result.name, supplier: result.suppliers});
        if(elements.length === 0) {
            let layers = result.layers.split(',');
            for(let i in layers) {
                result.layer = layers[i];
                let suggestion = new ElementSuggestion(result);
                if (suggestion.supplier === 'Self') {
                    // Check if there is a supplier already in the list.
                }
            }
        } else {
            let engagement =  new Engagement(result);

        }
        // If if does then use it.
        // If it doesn't then create a Suggestion for the Element.
        // Now check if the partner exists if they do not then create  a Suggestion.
    }

    return results;
}