const fs = require('fs');

module.exports = {
    friendlyName: 'accept',
    description: 'Accept the ElementSuggestion for the context provided.',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {

        let newElement = Element.find(obj.name);
        if(!newElement) {
            newElement = new Element({name: obj.name, description: obj.description});
        }
        let partner = obj.partner;
        let pObj = Partner.find(partner);
        if(pObj) {
            newElement.addToPartners(pObj);
        } else {
            console.error("Partner Not Found");
        }
        let layer = object.layer;
        let lObj = Layer.find(layer);
        if(lObj) {
            newElement.addToLayers(layer);
        }
        newElement.save();
        obj.artifact = newElement;
        obj.save();
        return obj;
    }
};
