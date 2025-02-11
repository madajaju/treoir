
class EngagementSuggestion {
    static definition = {
        name: 'EngagementSuggestion',
        description: 'Suggestion to create an engagement for the customer fomr the AI.',
        extends: 'Suggestion',
        attributes: {
        },
        associations: {
            artifact: {
                type: 'Enagement',
                cardinality: 1,
                composition: false,
                owner: false,
            },
        },
    }
}

module.exports = EngagementSuggestion;

