const fs = require('fs');

module.exports = {
    friendlyName: 'convert',
    description: 'Convert Layer file',
    static: true, // True is for Class methods. False is for object based.
    inputs: {
        phase: {
            description: 'Phase in a JSON format',
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
        let phase = inputs.phase;
        let phaseObj = Phase.find(phase.name);
        if (!phaseObj) {
            phaseObj = new Phase({id: phase.name, name: phase.name});
        }
        phaseObj.name = phase.name;
        phaseObj.description = phase.description;
        phaseObj.color = phase.color;
        phaseObj.order = phase.order;
        phaseObj.targetDate = phase.targetDate;
        phaseObj.details = phase.details;
        phaseObj.kpis = phase.kpis;
        phaseObj.save();
        for (let sname in phase.suppliers) {
            let supplierObj = Supplier.fromJSON({supplier: phase.suppliers[sname]});
            supplierObj.save();
            phaseObj.addToSuppliers(supplierObj);
        }
        phaseObj.save();
        return phaseObj;
    }
};
