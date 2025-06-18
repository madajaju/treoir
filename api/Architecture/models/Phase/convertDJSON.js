module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert to Descriptive JSON that has the definition of the Class in _type. Used for the UI',
    static: false, // True is for Class methods. False is for object based.
    inputs: {},

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {

        let retval = {};
        for (let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        retval.suppliers = {};
        for (let sname in obj.suppliers) {
            let supplier = obj.suppliers[sname];
            retval.suppliers[supplier.name] = supplier.convertDJSON();
        }
        retval._type = "Phase";
        return retval;
    }
};