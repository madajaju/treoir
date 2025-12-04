module.exports = {
    friendlyName: 'fromJSON',
    description: 'Convert Layer file to Objects',
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
        let layerObjects = [];
        let layers = inputs.layers;
        for(let lname in layers) {
            let layer = layers[lname];
            let layerObj = Layer.find(lname);
            if(!layerObj) {
                layerObj = new Layer({id: lname});
            }
            layerObj.name = layer.name || lname;
            layerObj.description = layer.description;
            layerObj.purpose = layer.purpose || 'TBD';
            layerObj.color = layer.color;
            layerObj.orientation = layer.orientation;
            layerObj.position = layer.position;


            layerObj.save();
            if(layer.stakeholders) {
                layerObj._stakeholders = layer.stakeholders;
            }
            for(let i in layer.relationships) {
                let rel = layer.relationships[i];
                let relObj = new LayerRelationship( {
                    name: rel.name,
                    description: rel.description,
                    from: layerObj,
                });
                relObj._to = rel.to;
                layerObj.addToRelationships(relObj);
            }
            for(let ename in layer.assets) {
                let asset = Asset.fromJSON({asset: layer.assets[ename], owner: layerObj});
                layerObj.addToAssets(asset);
            }
            _processSubLayers(layerObj, layer);
            layerObjects.push(layerObj);
        }
        return layerObjects;
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
        subLayerObj.purpose = subLayer.purpose;
        subLayerObj.color = subLayer.color || _lightenColor(layerObj.color, 20); // Inherit from parent.
        subLayerObj.orientation = subLayer.orientation || layerObj.orientation; // Inherit from parent.
        subLayerObj.position = subLayer.position;
        subLayerObj.save();
        if(subLayer.stakeholders) {
            subLayerObj._stakeholders = subLayer.stakeholders;
        }
        for(let i in subLayer.relationships) {
            let rel = subLayer.relationships[i];
            let relObj = new LayerRelationship( {
                name: rel.name,
                description: rel.description,
                from: subLayerObj,
            });
            relObj._to = rel.to;
            subLayerObj.addToRelationships(relObj);
        }
        for(let ename in subLayer.assets) {
            let asset = Asset.fromJSON({asset: subLayer.assets[ename], owner: subLayerObj});
            subLayerObj.addToAssets(asset);
        }
        layerObj.addToLayers(subLayerObj);
        layerObj.save();
        if(subLayer.layers) {
            _processSubLayers(subLayerObj, subLayer);
        }
    }
    _fixPositions(layerObj);
    return layerObj;
}

function _fixPositions(layer) {
    let total = layer.layers.length;
    let cols = 2;
    let rows = Math.round(total / 2);
    let count = 1;
    for(let i in layer.layers) {
        let sublayer = layer.layers[i];
        let row = Math.floor(count / cols) + 1;
        let col = (count % cols) + 1;
        if(!sublayer.position || !sublayer.position.hasOwnProperty('row')) {
            sublayer.position = { row: row, col: col };
        }
        count++;
    }
    return;
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