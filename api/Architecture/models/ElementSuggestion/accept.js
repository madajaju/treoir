const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert Element JSON',
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
            newElement = new ELement({name: obj.name, description: obj.description});
        }
        let partnerArray = obj.partners.split(',');
        for(let i in partnerArray) {
            let partner = partnerArray[i];
            let pObj = Partner.find(partner);
            if(pObj) {
                newElement.addToPartners(pObj);
            } else {
                console.error("Partner Not Found");
            }
        }
        let layerArray = obj.layers.split(',');
        for(let i in layerArray) {
            let layer = loayerArray[i];
            let lObj = Layer.find(layer);
            if(lObj) {
                newElement.addToLayers(layer);
            }
        }
        newElement.save();
        obj.artifact = newElement;
        obj.save();
        return obj;
    }
};
