module.exports = {
    friendlyName: 'validate',
    description: 'Validate the workflow structure and integrity.',
    static: false, // Instance-based method
    inputs: {},

    exits: {
        valid: (value) => { value === true; },
    },

    fn: function (obj, inputs, env) {
        const hasName = !!obj._attributes.name;
        const hasTasks = obj._associations.tasks?.length > 0;
        const isValid = hasName && hasTasks;

        if (!isValid) {
            console.log('Validation failed:', { hasName, hasTasks });
        }

        return isValid;
    }
};