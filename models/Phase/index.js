
class Phase {
    static definition = {
        name: 'Phase',
        description: 'Description ' +
            'long description',
        attributes: {
            attr1: {
                type: 'string',
                description: 'description' +
                    ' long description'
            }
        },
        associations: {
            assoc1: {
                type: 'ModelName',
                cardinality: 1,
                composition: false,
                owner: false,
            },
        },
        /*
        statenet: {
            Init: {
                description: "Initial Phase"
                events: {
                    create: {
                        PhaseName: { }
                    }
                }
            },
            PhaseName: {
                description: "My Description of the state",
                events: {
                    eventName: {
                        PhaseName: {
                            condition: function(obj) { ... },
                            action: function(obj) { ... },
                        }
                    },
                    eventName2 ...
                }
                actions: {
                    entry: { entry1: function(obj) { ... } },
                    exit: { exit1: function(obj): { ... } }
                }
            }
        }
        */
    }
}

module.exports = Phase;

