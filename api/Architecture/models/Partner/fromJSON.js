const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        partners: {
            description: 'Partners in a JSON format',
            type: 'json',
            required: true
        }
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {
        let partners = inputs.partners;
        for(let pname in partners) {
            let partner = partners[pname];
            let partnerObj = Partner.find(pname);
            if(!partnerObj) {
                partnerObj = new Partner({id: pname, name: pname});
            }
            partnerObj.name = partner.name || pname;
            partnerObj.description = partner.description;
            partnerObj.color = partner.color;
            partnerObj.save();
            for(let ename in partner.elements) {
                let element = Element.fromJSON({element: partner.elements[ename], owner: partnerObj});
                element.save();
                partnerObj.addToElements(element);
                partnerObj.save();
            }
            for(let ename in partner.suggestions) {
                let sugg = Suggestion.fromJSON({element: partner.elements[ename], owner: partnerObj});
                sugg.save();
                partnerObj.addToSuggestions(sugg);
                partnerObj.save();
            }
            for(let rname in partner.regions) {
                let level = partner.regions[rname];
                let regionObj = new Region({id: rname, name: rname});
                let influence = new PartnerInfluence({level: level, partner:partnerObj, region:regionObj});
                partnerObj.addToRegions(influence);
                regionObj.addToPartners(influence);
                partnerObj.save();
            }
            for(let ename in partner.assets) {
                let asset = Asset.fromJSON({asset: partner.assets[ename], owner: partnerObj});
                partnerObj.addToAssets(asset);
            }
        }
        return partners;
    }
};
