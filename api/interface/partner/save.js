const fs = require('fs');

module.exports = {
    friendlyName: 'export',
    description: 'Export the partner file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            description: 'ID of the partner',
            type: 'string', // string|boolean|number|json
            required: true,
        },
    },

    exits: {
        json: (obj) => {
             return obj;
        }
    },

    fn: function (inputs, env) {
        let partner = Partner.find(inputs.id);
        if(!partner) {
            return {status: 404, message: "Partner not found"};
        }
        let retObj = {
        };
        retObj[partner.name] = {
            name: partner.name,
            color: partner.color,
            description: partner.description,
            elements: {},
        }
        for(let ename in partner.elements) {
            let element = partner.elements[ename];
            retObj[partner.name].elements[element.name] = {
                name: element.name,
                color: element.color,
                description: element.description,
                layers: [],
            };
            for(let lname in element.layers) {
                let layer = element.layers[lname];
                retObj[partner.name].elements[element.name].layers.push(layer.name);
            }
        }
        const retStr = JSON.stringify(retObj, null, 4);
        const filename = `${partner.name.replaceAll(' ','')}.json`;
        env.res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        env.res.setHeader('Content-type', 'application/json');
        env.res.end(retStr);
    }
};
