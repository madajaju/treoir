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
    },

    exits: {
        json: (obj) => {
             return obj;
        }
    },

    fn: async function (inputs, env) {
        // Ok this will create a md file that can be converted to other formats as required.
        // Take the customer JSON file and for each High level architecture for GEAR generate an md section for it based on the json file.
        // The output of the md should follow the following outline.
        // # Customer Name, Description based on the customer JSON file.
        // Outline of the high level architecture of GEAR and how the customer maps to it.
        // Now for each of the GEAR architecture sections create the following.
        // # GEAR Architecture name, description based on the GEAR JSON file and the customer JSON file.
        // # Identify any gaps in the customer JSON file that are not covered by the GEAR JSON file.
        // # Make any suggestions on how to fill in the gaps.
        // Finish the document with a summary of the company profile and potential areas for improvement.


        let customer = Customer.find(inputs.id);
        if(!customer) {
            return {status: 404, message: `Customer ${inputs.id} not found`};
        }
        fs.mkdirSync(path.resolve(__dirname, "../../../.uploads"), {recursive: true});
        let filename =  path.resolve(__dirname, "../../../.uploads",`${customer.name.replaceAll(' ','')}.md`);
        if(fs.existsSync(filename)) {
            let retString = fs.readFileSync(filename, 'utf8');
            AEvent.emit('customer.export.complete', {status: 'complete', text: retString});
            return retString;
        } else {
            let results = await customer.producePDF(inputs);
            fs.writeFileSync(filename, results);
            let retString = results;
            env.res.end(retString);
            return results;
        }
    }
};