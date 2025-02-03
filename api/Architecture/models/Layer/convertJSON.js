const fs = require('fs');
const Layer = require("./index");

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the layer to JSON',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let retval = {};
        for(let aname in obj._attributes) {
            let attr = obj._attributes[aname];
            retval[aname] = attr;
        }
        retval = _processSubLayers(retval, obj);
        return retval;
    }
};

function _processSubLayers(retval, layer) {
    retval.layers = {};

    for(let lname in layer.layers) {
        let tempLayer = {};
        let subLayer = layer.layers[lname];
        for (let aname in subLayer._attributes) {
            tempLayer[aname] = subLayer._attributes[aname];
        }
        retval.layers[tempLayer.name] = tempLayer;
        if(subLayer.layers) {
             _processSubLayers(retval.layers[tempLayer.name], subLayer);
        }
    }
    return retval;
}