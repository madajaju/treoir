const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        layers: {
            description: 'Layers in a JSON format',
            type: 'json',
            required: true
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {
        let layers = inputs.layers;
        for(let lname in layers) {
            let layer = layers[lname];
            let layerObj = Layer.find(lname);
            if(!layerObj) {
                layerObj = new Layer({id: lname});
            }
            layerObj.name = layer.name || lname;
            layerObj.description = layer.description;
            layerObj.color = layer.color;
            layerObj.orientation = layer.orientation;
            layerObj.save();
            _processSubLayers(layerObj, layer);
        }
        return;
    }
};

function _processSubLayers(layerObj, layer) {
    for(let lname in layer.layers) {
        let subLayer = layer.layers[lname];
        let newLName = layerObj.id + "-" + lname;
        let subLayerObj = Layer.find(newLName);
        if(!subLayerObj) {
            subLayerObj = new Layer({id: newLName});
        }
        subLayerObj.name = subLayer.name || lname;
        subLayerObj.description = subLayer.description;
        subLayerObj.color = subLayer.color || _lightenColor(layerObj.color, 20); // Inherit from parent.
        subLayerObj.orientation = subLayer.orientation || layerObj.orientation; // Inherit from parent.
        subLayerObj.position = subLayer.position;
        subLayerObj.save();
        layerObj.addToLayers(subLayerObj);
        layerObj.save();
        if(subLayer.layers) {
            _processSubLayers(subLayerObj, subLayer);
        }
    }
    return layerObj;
}

function _lightenColor(hex, percent) {
    // Convert hex color to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate the amount of lightening
    const newR = Math.min(255, r + (255 - r) * percent / 100);
    const newG = Math.min(255, g + (255 - g) * percent / 100);
    const newB = Math.min(255, b + (255 - b) * percent / 100);

    // Convert back to hex format
    return (
        "#" +
        [newR, newG, newB]
            .map(value => Math.round(value).toString(16).padStart(2, '0'))
            .join("")
    );
}