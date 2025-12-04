const fs = require('fs');

module.exports = {
    friendlyName: 'fromJSON',
    description: 'Convert fromJSON to Ailtire Objecct',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        stakeholders: {
            description: 'Array of stakeholders from the JSON',
            type: 'array',
            required: true
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        let retval = [];
        for(let i in inputs.stakeholders) {
            let stakeholder = inputs.stakeholders[i];
            let stakeholderObj = Stakeholder.find(stakeholder.name);
            if (!stakeholderObj) {
                stakeholderObj = new Stakeholder({id: stakeholder.name, name: stakeholder.name, description: stakeholder.description});
            }
            stakeholderObj.save();
            retval.push(stakeholderObj);
        }
        return retval
    }
};
