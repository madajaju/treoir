const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the Partner to JSON',
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
        retval.elements = {};
        for(let ename in obj.elements) {
            let element = obj.elements[ename];
            retval.elements[element.name] = element.convertJSON();
        }
        return retval;
    }
};