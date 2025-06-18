module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert to Descriptive JSON that has the definition of the Class in _type. Used for the UI',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let retval = obj.convertJSON();
        retval._type = "Asset";
        return retval;
    }
};