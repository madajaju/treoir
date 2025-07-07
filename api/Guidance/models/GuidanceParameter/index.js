
class GuidanceParameter {
    static definition = {
        name: 'GuidanceParameter',
        description: 'This is the parameter class for guidance elements primarily for inputs and outputs.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the parameter',
            },
            description: {
                type: 'string',
                description: 'This is a discription of the parameter',
            },
            type: {
                type: 'string',
                description: 'Type of parameter',
            },
            required: {
                type: 'boolean',
                description: 'Is the parameter required.'
            },
        },
        associations: {
        }
    }
}

module.exports = GuidanceParameter;

