
class Layer {
    static definition = {
        name: 'Layer',
        description: 'Layer of the Architecture',
        attributes: {
            name: {
                type: 'string',
                description: "Name of the layer",
            },
            description: {
                type: "description",
                description: "Description of the layer"
            },
            position: {
                type: "json",
                description: "Position in the architecture row,col,rowspan, colspan"
            },
            color: {
                type: "string",
                description: "Color of the layer in the architecture."
            },
            orientation: {
                type: "string",
                description: "top,bottom, left, right, front, back"
            },
        },
        associations: {
            layers: {
                description: "This represents the sublayers of the layer. This allows for n levels of aggregation.",
                type: 'Layer',
                cardinality: 'n',
                composition: true,
                owner: true,
            },
            elements: {
                type: 'Element',
                cardinality: 'n',
                description: "Elements supported in this layer of the architecture."
            }
        },
    }
}

module.exports = Layer;

