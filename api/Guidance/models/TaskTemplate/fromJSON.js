const AClass = require("ailtire/src/Server/AClass");

module.exports = {
    friendlyName: 'fromJSON',
    description: 'Create a TaskTemplate instance from a JSON object',
    static: true, // Class-based method
    inputs: {
        json: {
            type: 'ref',
            description: 'The JSON object to convert into a TaskTemplate instance.',
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {
        const id = inputs.json.id || inputs.json.name;
        const template = new TaskTemplate({id:id});

        // Map JSON object to attributes
        for (let attr in inputs.json) {
            if (template.definition.attributes[attr]) {
                template._attributes[attr] = inputs.json[attr];
            }
        }

        // Map JSON object to associations
        for (let assocName in template.definition.associations) {
            const assocDef = template.definition.associations[assocName];
            if (inputs.json[assocName]) {
                if (assocDef.cardinality === 1) {
                    const cls = AClass.getClass(assocDef.type);
                    template._associations[assocName] = cls.fromJSON({json: inputs.json[assocName]});
                } else {
                    template._associations[assocName] = inputs.json[assocName].map(assoc => {
                            const cls = AClass.getClass(assocDef.type);
                            return cls.fromJSON({json:assoc});
                        }
                    );
                }
            }
        }
        return template;
    }
};