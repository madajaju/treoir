const fs = require('fs');
const Layer = require("express/lib/router/layer");

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

    fn: function (obj, inputs, env) {
        let file = inputs.file;

        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const partners = JSON.parse(fileContent);
        for(let pname in partners) {
            let partner = partners[pname];
            let partnerObj = Partner.find(partner.name);
            if(!partnerObj) {
                partnerObj = new Partner({name: partner.name});
            }
            partnerObj.description = partner.description || partnerObj.description || '';
            partnerObj.color = partner.color || partnerObj.color || '';
            partnerObj.save();
            for(let element in partner.elements) {
                let elementObj = Element.find(element.name);
                if(!elementObj) {
                    elementObj = new Element({name: element.name});
                }
                elementObj.description = element.description || elementObj.description || '';
                elementObj.color = element.color || elementObj.color || '';
                for(let i in element.layers) {
                    let layer = element.layers[i];
                    let layerObj = Layer.find({id: layer.name});
                    if(!layerObj) {
                        console.error("Layer not found", layer);
                    }
                    elementObj.addToLayers(layerObj);
                }
                elementObj.save();
            }
            partnerObj.save();
        }
        return;
    }
};
