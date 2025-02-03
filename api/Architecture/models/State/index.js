
class State {
    static definition = {
        name: 'State',
        description: 'This is the state of the customers current systems in the organization.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the state, there should be current and future states',
            },
            order: {
                type: 'number',
                description: 'Order number',
            },
            description: {
                type: 'string',
                description: 'Description of the state',
            },
            targetDate: {
                type: 'date',
                description: 'Target date for the state',
            },
            details: {
                type: 'json',
                description: 'Details of the state',
            },
            kpis: {
                type: 'json',
                description: 'KPIs of the state',
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

module.exports = State;

