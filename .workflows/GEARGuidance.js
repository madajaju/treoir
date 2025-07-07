module.exports = {
    name: "GEAR Guidance Account Executive",
    description: "This guides Account Executives to capture customer  environments in the GEAR environment. It consists" +
        " of 5 stagess: Identify, Understand, Unify, Captialize and Augment.",
    inputs: {
        organizationName: {
            name: 'Organization Name',
            description: "This is the name of the organization that is being analyzed",
            type: 'string',
            required: true,
        }
    },
    objective: "The objective is to help to help the organization understand their operating environment so they can " +
        "adopt digital transformation faster. This is done by mapping their current environment to the GEAR standard " +
        "and then performing a gap analysis which should also make recommendations to move forward with appropriate changes.",
    outputs: {
        gapAnalysis: {
            name: "Gap Analysis",
            description: "This is a md document that has a gap analysis of the organization and where gaps in their environment are identified",
            type: 'doc',
            required: true,
        },
        gearMap: {
            name: "GEAR Mapping",
            description: "This is a mapping of the organizations environment to the GEAR Map.",
            type: 'json', // This should have the format of the json file here or make it a type that is looked up.
            required: true,
        }
    },
    stages: {
        Identify: {
            name: "Identify",
            description: "This is the first phase of the process",
            objective: "",
            inputs: {

            },
            context: {

            },
            outputs: {

            }
        },
        Understand: {

        },
        Unify: {

        },
        Capitalize: {

        },
        Augment: {

        }
    },
    templates: {

    }
}