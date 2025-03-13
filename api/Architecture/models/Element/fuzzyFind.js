const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert Element JSON',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        owner: {
            description: 'owner of the element',
            type: 'string',
            required: true
        },
        element: {
            description: 'element in a JSON format',
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
        let element = inputs.element;
        let owner = inputs.owner;
        let eid = inputs.owner.id + "-" + element.name;
        let elementObj = Element.find(eid);
        if (!elementObj) {
            elementObj = new Element({id: eid, name: element.name});
        }
        elementObj.description = element.description;
        elementObj.color = element.color;
        elementObj.save();
        for (let i in element.layers) {
            let lname = element.layers[i];
            let layer = Layer.find(lname);
            if (!layer) {
                console.error("Layer not found: " + lname);
            }
            elementObj.addToLayers(layer);
            elementObj.save();
        }
        return elementObj;
    }
};
