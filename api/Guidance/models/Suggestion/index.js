
class Suggestion {
    static definition = {
        name: 'Suggestion',
        description: 'A Suggestion is a Suggestion to create something in the system from the AI.',
        attributes: {
           name: {
                type: 'string',
                description: 'Name of the suggestion.',
            },
            description: {
               type: 'string',
                description: 'Description of the suggestion.',
            }
        },
        associations: {
            task: {
                tyoe: 'TaskInstance',
                cardinality: 1,
                description: 'The task that this suggestion is for.',
            }
        },
        statenet: {
            Init: {
                description: "Initial Phase",
                events: {
                    create: {
                        Suggested: { }
                    }
                }
            },
            Suggested: {
                description: "The artifact is suggested to be created.",
                events: {
                    accept: {
                        Accepted: { }
                    },
                    reject: {
                        Rejected: {}
                    },
                },
            },
            Accepted: {
                description: "The Suggestion was accepted and the artifact can be created.",
                events: {
                    createArtifact: {
                        Realized: { },
                    },
                },
            },
            Realized: {
                description: "The Suggestion has been realized. The artifact has been created.",
            },
            Rejected: {
                description: "The Suggestion has been rejected by the user.",
            }
        }
    }
}

module.exports = Suggestion;

