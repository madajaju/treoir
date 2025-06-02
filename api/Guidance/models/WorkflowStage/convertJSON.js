module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the workflow stage to JSON',
    static: false,
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

        // Add attributes to the JSON result
        for (let aname in obj._attributes) {
            retval[aname] = obj._attributes[aname];
        }

        // Add associations to the JSON result
        if (depth > 1) {
            for (let aname in obj._associations) {
                const assoc = obj._associations[aname];
                if (obj.definition.associations[aname]?.cardinality === 1) {
                    retval[aname] = assoc.convertJSON ? assoc.convertJSON({ depth: depth - 1 }) : null;
                } else {
                    retval[aname] = assoc.map(item =>
                        item.convertJSON ? item.convertJSON({ depth: depth - 1 }) : null
                    );
                }
            }
        }

        retval.type = obj.definition.name;
        return retval;
    }
};