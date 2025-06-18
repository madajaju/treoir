const path = require('path');
const fs = require('fs');

module.exports = {
    friendlyName: 'image',
    description: 'Serve and image generated from the export',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        id: {
            description: 'ID of the image',
            type: 'string', // string|boolean|number|json
            required: true,
        },
    },

    exits: {
        json: (obj) => {
        }
    },

    fn: async function (inputs, env) {
        let fname = path.resolve(__dirname, "../../../.scratch",inputs.id);
        let retval = fs.readFileSync(fname, 'utf-8');
        env.res.setHeader("Content-Type", 'image/svg+xml');
        env.res.end(retval);
        return;
    }
};