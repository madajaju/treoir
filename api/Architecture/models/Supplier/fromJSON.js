const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Supplier JSON String',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        supplier: {
            description: 'Supplier in a JSON format',
            type: 'json',
            required: true
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        let supplier = inputs.supplier;
        let supplierObj = Supplier.find(supplier.name);
        if (!supplierObj) {
            supplierObj = new Supplier({id: supplier.name, name: supplier.name});
        }
        supplierObj.name = supplier.name;
        supplierObj.contact = supplier.contact;
        supplierObj.description = supplier.description;
        supplierObj.details = supplier.details;

       // Just store the name in the json.
        if(supplier.partner) {
            supplierObj.partner = Partner.find(supplier.partner);
        }
        supplierObj.save();

        for (let sname in supplier.engagements) {
            let engagementObj = Engagement.fromJSON({engagement: supplier.engagements[sname]});
            engagementObj.save();
            supplierObj.addToEngagements(engagementObj);
            supplierObj.save();
        }
        return supplierObj;
    }
};
