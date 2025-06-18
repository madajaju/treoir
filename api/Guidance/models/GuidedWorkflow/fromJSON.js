const AClass = require('ailtire/src/Server/AClass.js');

module.exports = {
    friendlyName: 'fromJSON',
    description: 'Create a GuidedWorkflow instance from a JSON object',
    static: true, // Class-based method
    inputs: {
        json: {
            type: 'ref',
            description: 'The JSON object to convert into a GuidedWorkflow instance.',
        }
    },

    exits: {
        instance: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let id = inputs.json.id || inputs.json.name;
        const workflow = new GuidedWorkflow({id:id});

        // Map JSON object to attributes
        for (let attr in inputs.json) {
            if (workflow.definition.attributes[attr]) {
                workflow._attributes[attr] = inputs.json[attr];
            }
        }

        // Map JSON object to associations
        for (let assocName in workflow.definition.associations) {
            const assocDef = workflow.definition.associations[assocName];
            if (inputs.json[assocName]) {
                if (assocDef.cardinality === 1) {
                    const cls = AClass.getClass(assocDef.type);
                    workflow._associations[assocName] = cls.fromJSON({json:inputs.json[assocName]});
                } else {
                    workflow._associations[assocName] = inputs.json[assocName].map(assoc => {
                            const cls = AClass.getClass(assocDef.type);
                            return cls.fromJSON({json:assoc});
                        }
                    );
                }
            }
        }
        return workflow;
    }
};