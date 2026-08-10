
class Stakeholder {
    static definition = {
        "name": 'Stakeholder',
        description: 'This is a Stakeholder of the system.',
        unique: (obj) => { return obj.name;},
        attributes: {
            "name": {
                type: 'string',
                description: 'Name of the Stakeholder',
            },
            description: {
                type: "text",
                description: "Description of the Stakeholder"
            },
        },
        associations: {
            layers: {
                type: 'Layer',
                cardinality: 'n',
                composition: false,
                description: 'Layer that the stakholder is involved in.',
            },
        },
    }
}

module.exports = Stakeholder;

