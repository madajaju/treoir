module.exports = {
    friendlyName: 'create',
    description: 'Create a new partner',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        name: {
            description: 'File to import',
            type: 'file',
            required: true
        },
        description: {
            description: 'Description of the customer to create',
            type: 'string',
            required: true
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (inputs, env) {
        let name = inputs.name;
        let description = inputs.description;

        let partner = Partner.find(name);
        if(!partner) {
            partner = new Partner({id: name, name: name});
        }
        partner.description = description;

        return partner;
    }
};
