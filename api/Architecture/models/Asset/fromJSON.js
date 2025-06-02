const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert Asset JSON',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        owner: {
            description: 'owner of the asset',
            type: 'string',
            required: true
        },
        asset: {
            description: 'asset in a JSON format',
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
        let asset = inputs.asset;
        let owner = inputs.owner;
        let eid = inputs.owner.id + "-" + asset.name;
        let assetObj = Asset.find(eid);
        if (!assetObj) {
            assetObj = new Asset({id: eid, name: asset.name});
        }
        assetObj.description = asset.description;
        assetObj.url = asset.url;
        assetObj.save();
        return assetObj;
    }
};
