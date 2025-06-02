const AClass = require("ailtire/src/Server/AClass");
module.exports = {
    friendlyName: 'fromJSON',
    description: 'Create a WorkflowStage from a JSON object',
    static: true,
    inputs: {
        json: {
            type: 'ref',
            description: 'JSON representation of WorkflowStage',
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {
        const id = inputs.json.id || inputs.json.name;
        const stage = new WorkflowStage({id:id});

        // Map attributes
        for (let attr in inputs.json) {
            if (stage.definition.attributes[attr]) {
                stage._attributes[attr] = inputs.json[attr];
            }
        }

        // Map associations
        for (let assocName in stage.definition.associations) {
            const assocDef = stage.definition.associations[assocName];
            if (inputs.json[assocName]) {
                const cls = AClass.getClass(assocDef.type);
                if (assocDef.cardinality === 1) {
                    const cls = AClass.getClass(assocDef.type);
                    stage._associations[assocName] = cls.fromJSON({json: inputs.json[assocName]});
                } else {
                    let items = [];
                    for(let i in inputs.json[assocName]) {
                        const cls = AClass.getClass(assocDef.type);
                        let newObj = cls.fromJSON({json: inputs.json[assocName][i]});
                        newObj.stage = stage;
                        items.push(newObj);
                    }
                    stage._associations[assocName] = items;
                }
            }
        }

        return stage;
    }
};