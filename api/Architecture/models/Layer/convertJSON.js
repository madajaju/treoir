const fs = require('fs');
const Layer = require("./index");

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the layer to JSON',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
        depth: {
            type: 'number',
            description: 'Depth of the recursion',
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let retval = {};
        let depth = Number(inputs?.depth) || Infinity;
        for(let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        let currentDepth = 1;
        if(currentDepth < depth) {
            retval = _processSubLayers(currentDepth+1,depth, retval, obj);
        }
        return retval;
    }
};

function _processSubLayers(currentDepth, targetDepth, retval, layer) {
    retval.layers = {};

    for(let lname in layer.layers) {
        let tempLayer = {};
        let subLayer = layer.layers[lname];
        for (let aname in subLayer._attributes) {
            tempLayer[aname] = subLayer._attributes[aname];
        }
        retval.layers[tempLayer.name] = tempLayer;
        if(subLayer.layers) {
            if(currentDepth < targetDepth) {
                _processSubLayers(currentDepth+1, targetDepth, retval.layers[tempLayer.name], subLayer);
            }
        }
    }
    return retval;
}