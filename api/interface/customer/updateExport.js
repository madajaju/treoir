const AIHelper = require("ailtire/src/Server/AIHelper");
const AEvent = require("ailtire/src/Server/AEvent");
const path = require('path');
const fs = require('fs');

module.exports = {
    friendlyName: 'export',
    description: 'Export the customer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            description: 'ID of the customer',
            type: 'string', // string|boolean|number|json
            required: true,
        },
        text: {
            description: 'Text to update the export with',
            type: 'string',
            required: true,
        }
    },

    exits: {
        json: (obj) => {
             return obj;
        }
    },

    fn: async function (inputs, env) {
        let customer = Customer.find(inputs.id);
        if(!customer) {
            return {status: 404, message: `Customer ${inputs.id} not found`};
        }
        fs.mkdirSync(path.resolve(__dirname, "../../../.uploads"), {recursive: true});
        let filename =  path.resolve(__dirname, "../../../.uploads",`${customer.name.replaceAll(' ','')}.md`);

        fs.writeFileSync(filename,inputs.text);
    }
};