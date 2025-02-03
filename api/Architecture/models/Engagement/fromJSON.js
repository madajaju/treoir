const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Engagement JSON String',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        engagement: {
            description: 'Engagement in a JSON format',
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
        let engagement = inputs.engagement;
        let engagementObj = Engagement.find(engagement.name);
        if (!engagementObj) {
            engagementObj = new Engagement({id: engagement.name, name: engagement.name});
        }
        engagementObj.name = engagement.name;
        engagementObj.description = engagement.description;
        engagementObj.details = engagement.details;

       // Just store the name in the json.
        // So I just need to do a find. It should be loaded already.
        if(engagement.element) {
            engagementObj.element = Element.find(engagement.element);
        }
        engagementObj.save();

        for (let sname in engagement.layers) {
            let layerObj = Layer.find(engagement.layers[sname]);
            engagementObj.addToLayers(layerObj);
            engagementObj.save();
        }
        return engagementObj;
    }
};
