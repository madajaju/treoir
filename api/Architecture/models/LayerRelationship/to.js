module.exports = {
    friendlyName: 'to',
    description: 'Convert Layer file to Objects',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        if (obj._associations.hasOwnProperty("to")) {
            return obj._associations.to;
        } else if (obj._to) {
            return Layer.find(obj._to);
        }
    }
};
