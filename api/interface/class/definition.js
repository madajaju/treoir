const AClass = require('ailtire/src/Server/AClass');

module.exports = {
    friendlyName: 'definition',
    description: 'Return the definition of a class',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        name: {
            type: 'string',
            required: true,
            description: 'Name of the class'
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: async function (inputs, env) {
        let clsName = inputs.name;

        let cls = AClass.getClass(clsName);
        if(!cls) { return {status: 404, message: `Class ${clsName} not found`};}
        let retval = {
            attributes: cls.definition.attributes,
            associations: cls.definition.associations
        };
        return retval;
    }
};
