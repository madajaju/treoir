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
        retval.regions ={};
        for(let i in obj.regions) {
            let influence = obj.regions[i];
            retval.regions[influence.region.name] = influence.level;
        }
        return retval;
    }
};