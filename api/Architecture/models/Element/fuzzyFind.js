const fs = require('fs');

module.exports = {
    friendlyName: 'fuzzyFind',
    description: 'Find a set of elements that contain the given string',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        query: {
            description: 'String to search for in the Elements.',
            type: 'string',
            required: true
        },
        supplier: {
            description: 'Name of the supplier to search for the element. If it is not given then search all of the elements.',
            type: 'string',
            required: false
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: async function (obj, inputs, env) {
        let query = inputs.query;
        let supplier = null;
        let element = Element.find(query);
        if (element) {
            if (!supplier || supplier === element.supplier.name) {
                return [element];
            }
        }
        let elements = await Element.instances();
        let retval = [];
        let queryString = query.toLowerCase();
        for(let i in elements) {
            let element = elements[i];
            if(element.name.toLowerCase() === queryString) {
                retval.push(element);
            } else if(element.id.toLowerCase() === queryString) {
                retval.push(element);
            } else if(element.name.toLowerCase().includes(queryString)) {
                retval.push(element);
            } else if(queryString.includes(element.name.toLowerCase())) {
                retval.push(element);
            } else if(queryString.replace(/\s/g,'').includes(element.name.toLowerCase().replace(/\s/g,''))) {
                retval.push(element);
            } else if(element.name.replace(/\s/g,'').includes(queryString.toLowerCase().replace(/\s/g,''))) {
                retval.push(element);
            }
        }
        return retval;
    }
};
