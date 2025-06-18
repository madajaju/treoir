
class EngagementSuggestion {
    static definition = {
        name: 'EngagementSuggestion',
        description: 'Suggestion to create an engagement for the customer fomr the AI.',
        extends: 'Suggestion',
        attributes: {
            details: {
                type: "json",
                description: "details about the engagement."
            },
            layer: {
                type: "string",
                description: "Layer of the engagement"
            }

        },
        associations: {
            element: {
                type: "Element",
                description: "Element of the engagement",
                cardinality: 1
            },
            customer: {
                type: "Customer",
                description: "Customer of the Engagement",
                cardinality: 1
            },
            artifact: {
                type: 'Engagement',
                cardinality: 1,
                composition: false,
                owner: false,
            },
            supplier: {
                type: 'Supplier',
                cardinality: 1,
                composition: false,
                owner: false,
            }
        },
    }
}

module.exports = EngagementSuggestion;

