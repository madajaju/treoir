const fs = require('fs');

module.exports = {
    friendlyName: 'import',
    description: 'Import Partner file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        file: {
            description: 'File to import',
            type: 'file',
            required: true
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (inputs, env) {
        let file = inputs.file;

        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const customerJSON = JSON.parse(fileContent);
        const customer = Customer.fromJSON({customer:customerJSON}) ;
        return customer;
    }
};
