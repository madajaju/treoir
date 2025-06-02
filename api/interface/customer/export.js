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
        let customer = Customer.find(inputs.id);
        if(!customer) {
            let customers =  await Customer.instances();
            for(let i in customers) {
                let c = customers[i];
                if(c.name === inputs.id) {
                    customer = c;
                    break;
                }
            }
        }
        if(!customer) {
            return {status: 404, message: `Customer ${inputs.id} not found`};
        }
        let retval = customer.convertJSON();
        const retStr = JSON.stringify(retval, null, 4);
        const filename = `${customer.name.replaceAll(' ','')}.json`;
        env.res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        env.res.setHeader('Content-type', 'application/json');
        env.res.end(retStr);
    }
};
