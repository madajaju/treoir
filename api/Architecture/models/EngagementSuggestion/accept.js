const fs = require('fs');

module.exports = {
    friendlyName: 'accept',
    description: 'Accept the ElementSuggestion for the context provided.',
    static: false, // True is for Class methods. False is for object based.
    inputs: {
        phase: {
            type: 'string',
            description: 'The Phase that the engagement should be added',
        }
    },

    exits: {
        json: (obj) => {
            return obj;
        },
    },

    fn: function (obj, inputs, env) {


        let customer = obj.customer;
        let myPhase = null;
        let phaseName = inputs.phase || "Current";
        for(let i in customer.phases) {
            let phase = customer.phases[i];
            if(phase.name === phaseName) {
                myPhase = phase;
            }
        }
        if(!myPhase) {

            myPhase =  new Phase({name: "Current", color: "#44ffff", order: 0, targetDate: new Date(), details: "Current Phase"})
            customer.addToPhases(myPhase);
        }
        // Now check for the supplier
        let mySupplier = null;
        let mySelfSupplier = null;
        for(let i in myPhase.suppliers) {
            let supplier = myPhase.suppliers[i];
            for (let j in obj.element.partners) {
                let partner = obj.element.partners[j];
                if (supplier.partner.name === partner.name) {
                    mySupplier = supplier;
                }
            }
            if(supplier.name === "Self") {
                mySelfSupplier = supplier;
            }
        }
        if(!mySupplier) {
            if(obj.element.partners.length > 0) {
                mySupplier = myPhase.addToSuppliers({
                    partner: obj.element.partners[0],
                    name: obj.element.partners[0].name
                });
            }
        }
        if(!mySupplier) {
            if(mySelfSupplier) {
                mySupplier = mySelfSupplier;
            } else {
                mySupplier = myPhase.addToSuppliers({name: "Self"});
            }
        }

        // Now make sure the engagement isn't already there.
        let newEngagement = null;
        for(let i in mySupplier.engagements) {
            let engagement = mySupplier.engagements[i];
            if(engagement.name === obj.name) {
                newEngagement = engagement;
            }
        }
        if(!newEngagement) {
            newEngagement = mySupplier.addToEngagements({name: obj.name, description: obj.description, element: obj.element});
        }
        newEngagement.addToLayers(obj.layer);
        obj.artifact = newEngagement;
        obj.save();
        customer.save();

        return obj;
    }
};
