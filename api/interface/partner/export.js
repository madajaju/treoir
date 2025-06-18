const AIHelper = require("ailtire/src/Server/AIHelper");
const AEvent = require("ailtire/src/Server/AEvent");
const path = require('path');
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

    fn: async function (inputs, env) {
        let partner = Partner.find(inputs.id);
        if(!partner) {
            return {status: 404, message: `Customer ${inputs.id} not found`};
        }
        fs.mkdirSync(path.resolve(__dirname, "../../../.uploads"), {recursive: true});
        let filename =  path.resolve(__dirname, "../../../.uploads",`${partner.name.replaceAll(' ','')}.md`);
        if(fs.existsSync(filename)) {
            let retString = fs.readFileSync(filename, 'utf8');
            AEvent.emit('partner.export.complete', {status: 'complete', text: retString});
            return retString;
        } else {
            let results = await partner.producePDF(inputs);
            fs.writeFileSync(filename, results);
            let retString = results;
            env.res.end(retString);
            return results;
        }
    }
};