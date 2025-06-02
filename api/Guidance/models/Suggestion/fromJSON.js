const fs = require('fs');

module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert Suggestion JSON',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        owner: {
            description: 'owner of the element',
            type: 'string',
            required: true
        },
        element: {
            description: 'element in a JSON format',
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
        let sugg = inputs.suggestion;
        let owner = inputs.owner;
        let eid = inputs.owner?.id + "-" + element.name;
        let suggObj = Suggestion.find(eid);
        if (!suggObj) {
            let clsName = sugg.type;
            let cls = AClass.getClass(clsName);
            suggObj = new cls({id: eid, name: sugg.name});
        }
        for(let aname in sugg) {
            if(suggObj.definition.associations.hasOwnProperty(aname)) {
                if(suggObj.definition.associations[aname].cardinality === 1) {
                    let cls = AClass.getClasss(sugg[aname].type)
                    suggObj[aname] = cls.find(sugg[aname].id);
                } else {
                    for(let i in sugg[aname]) {
                        let cls = AClass.getClasss(sugg[aname][i].type)
                        suggObj[aname].add(cls.find(sugg[aname][i].id));
                    }
                }
            } else {
                suggObj[aname] = sugg[aname];
            }
        }
        sugObj.save();
        return sugObj;
    }
};
