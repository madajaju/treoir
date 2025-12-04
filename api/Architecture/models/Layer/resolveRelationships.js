module.exports = {
    friendlyName: 'resolveRelationships',
    description: 'Convert all of the relationships from ids to objects. The relationships should be loaded before this function is called.',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
    },

    exits: {
        json: (obj) => { return obj; },
    },

    fn: function (obj, inputs, env) {

        let relationships = obj.relationships;
        for(let i in relationships) {
            let relationship = relationships[i];
            if(!relationship._associations.to) {
                let layer =  Layer.find({id: relationship._to});
                if(layer) {
                    relationship.to = layer;
                }
                else {
                    let layer =  Layer.find({name: relationship._to});
                    if(layer) {
                        relationship.to = layer;
                    } else {
                        console.log("Layer not found: " + relationship._to, "for relationship:", relationship._attributes);
                    }
                }
            }
        }

        for(let i in obj.layers) {
            let layer = obj.layers[i];
            layer.resolveRelationships();
        }
        return obj;
    }
};