module.exports = {
    friendlyname: 'resolveStakeholders',
    description: 'Convert all of the stakeholders from ids to objects. The stakholders should be loaded before this function is called.',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let stakeholders = obj._stakeholders;
        for(let i in stakeholders) {
            let shID = stakeholders[i];
            if(!obj.stakeholders[shID]) {
                let shObj = Stakeholder.find({"name": shID});
                obj.addToStakeholders(shObj);
            }
        }

        for(let i in obj.layers) {
            let layer = obj.layers[i];
            layer.resolveStakeholders();
        }
        return obj;
    }
};