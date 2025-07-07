class GuidedWorkflow {
    static definition = {
        name: 'GuidedWorkflow',
        description: 'A sequence of tasks to guide a solution architect through a GEAR mapping session.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the workflow or engagement.',
            },
            description: {
                type: 'string',
                description: 'What this workflow is intended to accomplish.',
            },
            objective: {
                type: 'string',
                description: 'What is the objective of the guidance based on the inputs and the desired outputs'
            },
            context: {
                type: 'json',
                description: 'Context for this workflow. This could be things generated during the workflow. This is used to ' +
                    'see if  the objective has been met. This can also create a thread of thought through the workflow. ' +
                    'Because this is attached to the to the workflow this gives the ability to see the context for each workflow independantly.',
            },
            status: {
                type: 'string',
                description: 'Current state of the workflow (e.g., initiated, in-progress, completed).',
            },
        },
        associations: {
            inputs: {
                unique: (obj) => { return obj.name},
                type: "GuidanceParameter",
                description: "These are the input parameters of the GuidedWorkflow",
                composite: true,
                owner: true,
            },
            outputs: {
                unique: (obj) => { return obj.name},
                type: "GuidanceParameter",
                description: "These are the outputs parameters of the GuidedWorkflow. The outputs can be required or optional. If the required flag is set to true then the parameter is required otherwise it is optional.",
                composite: true,
                owner: true,
            },
            tasks: {
                type: 'TaskInstance',
                cardinality: 'n',
                description: 'Tasks instantiated as part of this workflow.',
                owner: true,
            },
            templates: {
                type: 'TaskTemplate',
                cardinality: 'n',
                description: 'Task templates available in this workflow.',
                composite: true,
                owner: true,
            },
            stages: {
                type: 'WorkflowStage',
                cardinality: 'n',
                description: 'Stages of the workflow covering specific sets of tasks.',
                composite: true,
                owner: true,
            }
        },
        statenet: {
            Init: {
                description: "Initial phase of the GuidedWorkflow, before it is started.",
                events: {
                    start: {
                        InProgress: { }
                    }
                },
            },
            InProgress: {
                description: "The workflow is currently ongoing.",
                events: {
                    completeStage: {
                        NextStage: {
                            // Condition to check if there are stages left to transition to
                            condition: function (workflow) {
                                const currentStageIndex = workflow._attributes.currentStage || 0;
                                return currentStageIndex < workflow._associations.stages.length - 1;
                            },
                            // Actions to execute when transitioning to the next stage
                            action: function (workflow) {
                                workflow.moveToNextStage();
                                console.log("Workflow is transitioning to the next stage.");
                            },
                        },
                        Completed: {
                            // Condition to check if all stages are completed
                            condition: function (workflow) {
                                const currentStageIndex = workflow._attributes.currentStage || 0;
                                return currentStageIndex === workflow._associations.stages.length - 1;
                            },
                            // Actions to finalize the workflow
                            action: function (workflow) {
                                workflow.complete();
                                console.log("Workflow has transitioned to 'Completed' state.");
                            }
                        }
                    },
                },
            },

            NextStage: {
                description: "Intermediate state for transitioning to the next workflow stage.",
                events: {
                    proceed: {
                        InProgress: {
                            // Condition for re-entering "InProgress" after completing a stage
                            condition: function (workflow) {
                                return workflow._attributes.currentStage < workflow._associations.stages.length;
                            },
                            action: function (workflow) {
                                console.log("Returning to 'InProgress' for handling more stages.");
                            },
                        }
                    }
                },
            },

            Completed: {
                description: "The workflow has been completed, and all stages/tasks are finalized.",
                events: {
                    reset: {
                        Init: { }
                    }
                },
            }
        }
    }
}

module.exports = GuidedWorkflow;