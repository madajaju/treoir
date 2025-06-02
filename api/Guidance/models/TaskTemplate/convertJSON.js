module.exports = {
    friendlyName: 'convertJSON',
    description: 'Convert the task template to JSON',
    static: false, // Object-based method
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

        // Add attributes to JSON output
        for (let aname in obj._attributes) {
            retval[aname] = obj._attributes[aname];
        }

        // Add associations to JSON output
        if (depth > 1) {
            for (let aname in obj._associations) {
                const assoc = obj._associations[aname];
                retval[aname] = assoc && assoc.convertJSON ? assoc.convertJSON({ depth: depth - 1 }) : null;
            }
        }

        retval.type = obj.definition.name;
        return retval;
    }
};