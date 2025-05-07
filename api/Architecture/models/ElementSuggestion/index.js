
class ElementSuggestion {
    static definition = {
        name: 'ElementSuggestion',
        description: 'Suggestion made from the AI to create and element.',
        extends: 'Suggestion',
        attributes: {
            layer: {
                type: 'string',
                description: 'This is the name of the layer the element should be placed.',
            },
            partner: {
                type: 'string',
                description: 'This is the name of the partner of the element.'
            }
        },
        associations: {
            artifact: {
                type: 'Element',
                cardinality: 1,
                composition: false,
                owner: false,
            },
        },
    }
}

module.exports = ElementSuggestion;

