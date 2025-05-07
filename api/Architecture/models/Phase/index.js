
class Phase {
    static definition = {
        name: 'Phase',
        description: 'This is the phase of the customers current systems in the organization.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the phase, there should be current and future phases',
            },
            order: {
                type: 'number',
                description: 'Order number',
            },
            description: {
                type: 'string',
                description: 'Description of the phase',
            },
            targetDate: {
                type: 'date',
                description: 'Target date for the phase',
            },
            details: {
                type: 'json',
                description: 'Details of the phase',
            },
            kpis: {
                type: 'json',
                description: 'KPIs of the phase',
            }
        },
        associations: {
            suppliers: {
                type: 'Supplier',
                cardinality: 'n',
                composition: true,
                owner: true,
            },
        },
    }
}

module.exports = Phase;

