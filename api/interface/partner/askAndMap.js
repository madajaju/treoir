const AIHelper = require('ailtire/src/Server/AIHelper.js');
const AEvent = require("ailtire/src/Server/AEvent");
const elementJSON = `
        { 
            name": "MyElementName", // Name of the product or service being offered by the partner
            description: "Description on how the company uses the element."
            layers: "LayerID from GEAR", // comma separate list of the layerids from the GEAR architecture.
            evidence: "evidence": [
              { "source": "prompt", "excerpt": "…optional short quote…" },
              { "source": "document", "doc_id": "doc_xxx", "chunk_id": "c0007", "excerpt": "…optional short quote…" }
            ]
        }`;

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
        let messages = [];
        let partner = inputs.partner || 'new';

        let documents = inputs.documents;
        if(documents && typeof documents === 'string') {
            documents = documents.split(',');
        }

        if(typeof partner === 'string') {
            partner = Partner.find({id: partner});
        }
        if(!partner) {
            partner = new Partner({id: partner, name: partner});
        }
        if(documents) {
            // Then chunk the document and run the query on each of the junks.
            let results = [];
            for(let i = 0; i < documents.length; i++) {
                let document = TDocument.find({id: documents[i].replace(/,/g,'')});
                if(document) {
                    await document.processNodes({
                        fn: async (chunk) => {
                            let result = await _promptLLM(env, inputs.prompt, partner, chunk._attributes);
                            results.push(result);
                        }
                    });
                }
            }
            AEvent.emit("ai.complete", {text: ""});
            return results;
        } else {
            let results = await _promptLLM(env, inputs.prompt, partner);
            return results;

        }
    }
};

async function _promptLLM(env, prompt, partner, document) {

    let systemPrompt = `
    You are an enterprise architect helping an organization map a partner's offerings, including people, processes, 
    and technology offerings, to the GEAR Architecture. The GEAR Architecture is a conceptual framework used to 
    capture, and map offerings within partner ecosystem. Use this architecture to map the partner's 
    organizational, processes, technology, and physical hardware offerings. Your goal in this step is NOT to make 
    final architecture decisions but to IDENTIFY and LIST partner offerings. Do not map internal elements or GEAR 
    elements. Assume the user prompt contains information about the partner and their offerings.

Rules:
Map each identified element to one or more layer IDs ONLY from the list provided.
If unsure about a mapping, leave "layers" empty.
The output MUST be a JSON array that strictly follows the provided schema.
If no offerings are identifiable, return an empty array [].
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
        content: `Only return elements that are mentioned in the user prompt. Return an array of JSON object that fit 
        this output schema: ${elementJSON}`
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
    let retval = await AIHelper.askForCode(messages);
    if(Array.isArray(retval[0])) {
        retval = retval[0];
    }
    if(typeof retval[0] === 'string') {
        if(env.res) {
            env.res.end(retval[0]);
        }
        return retval;
    }

    let resultMD = _generateMD(retval);
    AEvent.emit("ai.result", {text: resultMD});
    if(resultMD.length !== 0) {
        await _mapElements(retval, partner);
    }
    return retval;
}

async function _mapElements(prompt, partner) {
    if(prompt[0].length === 0) {
       return;
    }
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

function _generateMD(results) {
    let md = "";
    for(let i in results) {
        let engagement = results[i];
        md += "## " + engagement.name + "\n\n";
        md += engagement.description + "(_" + engagement.layers + "_)" + "\n\n";
    }
    return md;
}