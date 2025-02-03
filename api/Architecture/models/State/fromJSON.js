const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        state: {
            description: 'State in a JSON format',
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
        let state = inputs.state;
        let stateObj = State.find(state.name);
        if (!stateObj) {
            stateObj = new State({id: state.name, name: state.name});
        }
        stateObj.name = state.name;
        stateObj.description = state.description;
        stateObj.color = state.color;
        stateObj.order = state.order;
        stateObj.targetDate = state.targetDate;
        stateObj.details = state.details;
        stateObj.kpis = state.kpis;
        stateObj.save();
        for (let sname in state.suppliers) {
            let supplierObj = Supplier.fromJSON({supplier: state.suppliers[sname]});
            supplierObj.save();
            stateObj.addToSuppliers(supplierObj);
        }
        stateObj.save();
        return stateObj;
    }
};
