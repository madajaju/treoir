
class LayerRelationship {
    static definition = {
        "name": 'LayerRelationship',
        description: 'This represents a relationship between layers',
        attributes: {
            "name": {
                type: 'enum',
                description: "Name of the layer, contains (composition)\n" +
                    "* depends_on (dependency)\n" +
                    "* enables (capability enablement)\n" +
                    "* realizes (implementation)\n" +
                    "* complies_with (policy or standard conformance)\n" +
                    "* flows_to (data/control flow)\n" +
                    "* influences (governance or strategic impact)",
                properties: [ 'depends_on', 'enables', 'realizes', 'complies_with', 'flows_to', 'influences']
            },
            description: {
                type: "text",
                description: "Description of the layer"
            },
        },
        associations: {
            from: {
                description: "This is the layer that this relationship is from also the owning layer of the relationship.",
                type: 'Layer',
                cardinality: 1,
            },
            to: {
                type: 'Layer',
                cardinality: 1,
                description: "This is the layer that this relationship is to."
            },
        },
    }
}

module.exports = LayerRelationship;

