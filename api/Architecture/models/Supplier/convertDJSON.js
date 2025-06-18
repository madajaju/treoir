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
        let retval = {};
        for(let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        if(obj.partner) {
            retval.partner = obj.partner.name;
        }
        retval.engagements = {};
        for(let sname in obj.engagements) {
            let engagement = obj.engagements[sname];
            retval.engagements[engagement.name] = engagement.convertJSON();
        }
        retval._type = "Supplier";
        return retval;
    }
};