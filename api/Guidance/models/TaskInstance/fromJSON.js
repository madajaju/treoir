const AClass = require("ailtire/src/Server/AClass");
module.exports = {
    friendlyName: 'fromJSON',
    description: 'Create a TaskInstance from a JSON object',
    static: true,
    inputs: {
        json: {
            type: 'ref',
            description: 'JSON representation of TaskInstance',
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {
        const id = inputs.json.id || inputs.json.name;
        const instance = new TaskInstance({id:id});

        // Map attributes
        for (let attr in inputs.json) {
            if (instance.definition.attributes[attr]) {
                instance._attributes[attr] = inputs.json[attr];
            }
        }

        // Map associations
        for (let assocName in instance.definition.associations) {
            const assocDef = instance.definition.associations[assocName];
            if (inputs.json[assocName]) {
                if(assocDef.owner) {
                    if (assocDef.cardinality === 1) {
                        const cls = AClass.getClass(assocDef.type);
                        instance._associations[assocName] = cls.fromJSON({json: inputs.json[assocName]});
                    } else {
                        instance._associations[assocName] = inputs.json[assocName].map(assoc => {
                                const cls = AClass.getClass(assocDef.type);
                                return cls.fromJSON({json: assoc});
                            }
                        );
                    }
                } else {
                    if (assocDef.cardinality === 1) {
                        instance._associations[assocName] = inputs.json[assocName];
                    } else {
                        instance._associations[assocName] = inputs.json[assocName].map(assoc => {
                                return assoc;
                            }
                        );
                    }
                }
            }
        }

        return instance;
    }
};