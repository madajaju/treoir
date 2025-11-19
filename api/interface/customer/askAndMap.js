const fs = require('fs');
const AIHelper = require('ailtire/src/Server/AIHelper.js');
const AEvent = require('ailtire/src/Server/AEvent.js');
const elementJSON = `
        { 
            "name": "MyElementName", // Name of the tool, process, or service
            "suppliers": "MySupplierName|Self", // Name of the supplier/vendor of the element, use Self if the customer has built the element themselves. Comma separate if more than one vendor for the element.
            "description": "Description on how the company uses the element."
            "layers": "LayerID from GEAR", // comma separate list of the layerids from the GEAR architecture.
            evidence:"evidence": [
              { "source": "prompt", "excerpt": "…optional short quote…" },
              { "source": "document", "doc_id": "doc_xxx", "chunk_id": "c0007", "excerpt": "…optional short quote…" }
            ] 
        }`;

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
        },
        documents: {
            description: 'Document ID',
            type: 'Array',
            required: false,
            properties: {
                type: 'string',
                description: 'Document ID',
                required: false,
            }
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        }
    },

    fn: async function (inputs, env) {
        let customer = inputs.customer || 'new';
        let documents = inputs.documents;
        if(documents && typeof documents === 'string') {
            documents = documents.split(',');
        }
        if(typeof customer === 'string') {
            customer = Customer.find({name: customer});
        }
        if(!customer) {
            customer = new Customer({name: customer});
        }

        if(documents) {
            // Then chunk the document and run the query on each of the junks.
            let results = [];
            for(let i = 0; i < documents.length; i++) {
                let document = TDocument.find({id: documents[i].replace(/,/g,'')});
                if(document) {
                    await document.processNodes({
                        fn: async (chunk) => {
                            let result = await _promptLLM(env, inputs.prompt, customer, chunk._attributes);
                            results.push(result);
                        }
                    });
                }
            }
            AEvent.emit("ai.complete", {text: ""});
            return results;
        } else {
            let results = await _promptLLM(env, inputs.prompt, customer);
            return results;

        }
    }
};

async function _promptLLM(env, prompt, customer, document) {
    let systemPrompt = `
        You are a enterprise architect that is helping an organization map their current environment
             including people, process and technology to the GEAR Architecture. The GEAR architecture is a
            conceptual architecture that is used to capture and map current environments and identify gaps.
            The GEAR Architecture has the following layers. Use this architecture to help map the organization's
            organizational architecture, process, technology and physical hardware environments. 
            If there is not a mapping do not create one, only map the tools mentioned and not neccessarily what underlying elements are required to support the tools. Here are the layers:

Your goal in this step is NOT to make final architecture decisions. Your goal is to IDENTIFY and LIST the explicit tools, 
platforms, services, processes, or organizational constructs.

Rules:
1. If a vendor or supplier is not mentioned, set "suppliers" to "Self".
2. Map each identified element to one or more FIRST-LAYER GEAR layer IDs ONLY from the list provided.
3. If you are unsure about a mapping, leave "layers" empty.
4. The output MUST be a JSON array that strictly follows the provided schema. 
5. If no elements are identifiable, return an empty array [].

Be concise and factual. Do not explain your reasoning.

Here are the available GEAR layers (first-layer only):
        `

    let layers = await Layer.instances();
    let layersJSON = {};
    for (let lname in layers) {
        if(!lname.includes('-')) {
            layersJSON[lname] = layers[lname].convertJSON({depth:2});
        }
    }
    let systemInfo = JSON.stringify(layersJSON);
    let messages = [];
    messages.push({
        role: 'system',
        content: systemPrompt,
    });
    messages.push({
        role: 'system',
        content: `Here are the layers of GEAR: ${systemInfo}`,
    });
    messages.push({
        role: 'system',
        content: `Only return elements that are mentioned in the user prompt. Return an array of JSON object that fit this output schema: ${elementJSON}`
    });
    if(document) {
        messages.push({
            role: 'user',
            content: `Document to use to augment the user prompt: ${JSON.stringify(document)}`,
            name: 'document'
        });
        messages.push({
            role: 'user',
            content: prompt,
            name: 'prompt',
        });
    } else {
        messages.push({
            role: 'user',
            content: prompt,
            name: 'prompt',
        });
    }
    let results = await AIHelper.askForCode(messages);
    if(Array.isArray(results[0])) {
        results = results[0];
    }
    if(typeof results[0] === 'string') {
        if(env.res) {
            env.res.end(results[0]);
        }
        return results;
    }

    let resultMD = _generateMD(results);
    AEvent.emit("ai.result", {text: resultMD});
    await _mapElements(results, customer);
    return results;
}

function _generateMD(results) {
    let md = "";
    for(let i in results) {
        let engagement = results[i];
        md += "## " + engagement.name + "\n\n";
        md += engagement.description + "(_" + engagement.layers + "_)" + "\n\n";
    }
    return md;
}
async function _mapElements(results, customer) {
    let layers = await Layer.instances();
    let layersJSON = {};
    for (let lname in layers) {
        if(!lname.includes('-')) {
            layersJSON[lname] = layers[lname].convertJSON({depth:2});
        }
    }
    systemInfo = JSON.stringify(layersJSON);
    /*
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

    // let results = await AIHelper.askForCode(messages, 'JSON');

     */
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