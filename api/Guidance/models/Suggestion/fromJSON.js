const AClass = require('ailtire/src/Server/AClass');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert Suggestion JSON',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        suggestion: {
            description: 'suggestion in a JSON format',
            type: 'json',
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {
        let sugg = inputs.suggestion;
        let eid = sugg.id;
        let suggObj = Suggestion.find(sugg.id);
        if (!suggObj) {
            let clsName = sugg.type;
            let cls = AClass.getClass(clsName);
            suggObj = new cls({id: eid, name: sugg.name});
        }
        for(let aname in sugg) {
            if(suggObj.definition.associations.hasOwnProperty(aname)) {
                if(suggObj.definition.associations[aname].cardinality === 1) {
                    let cls = AClass.getClass(sugg[aname].type)
                    let value = cls.find(sugg[aname].id);
                    if(value !== null) {
                       suggObj[aname] = value;
                    } else {
                        console.log(`Could not find ${sugg[aname].type} with id ${sugg[aname].id}`);
                    }

                } else {
                    for(let i in sugg[aname]) {
                        let cls = AClass.getClass(sugg[aname][i].type)
                        let value = cls.find(sugg[aname][i].id);
                        if(value !== null) {
                            suggObj[aname].add(value);
                        } else {
                            console.log(`Could not find ${sugg[aname].type} with id ${sugg[aname].id}`);
                        }
                    }
                }
            } else {
                suggObj[aname] = sugg[aname];
            }
        }
        suggObj.save();
        return suggObj;
    }
};
