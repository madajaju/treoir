
class SupplierSuggestion {
    static definition = {
        name: 'SupplierSuggestion',
        description: 'Suggestion to create a Supplier in the architecture.',
        extends: 'Suggestion',
        attributes: {
        },
        associations: {
            artifact: {
                type: 'Supplier',
                description: 'This is the supplier that was created from the suggestion.'
            }
        },
    }
}

module.exports = SupplierSuggestion;

