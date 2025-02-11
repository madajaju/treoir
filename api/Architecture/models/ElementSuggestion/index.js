
class ElementSuggestion {
    static definition = {
        name: 'ElementSuggestion',
        description: 'Suggestion made from the AI to create and element.',
        extends: 'Suggestion',
        attributes: {
            layers: {
                type: 'string',
                description: 'This is the name of the layers the element should be placed. This should be a comma separated list.'
            },
            partners: {
                type: 'string',
                description: "This is the name of the partners of the element. This should be a comma separated list.",
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

