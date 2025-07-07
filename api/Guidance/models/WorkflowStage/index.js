class WorkflowStage {
    static definition = {
        name: 'WorkflowStage',
        description: 'A phase or milestone in the workflow process, grouping related tasks.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the stage (e.g., Setup, Mapping, Validation).',
            },
            description: {
                type: 'string',
                description: 'What this stage is intended to accomplish.',
            },
            objective: {
                type: 'string',
                description: 'What this stage is intended to accomplish. It will use the context to determine if the objective has been met.',
            },
            context: {
                type: 'json',
                description: 'Context for this stage. This could be things generated during the stage. This is used to ' +
                    'see if  the objective has been met. This can also create a thread of thought through the workflow. ' +
                    'Because this is attached to the to the stage this gives the ability to see the context for each stage independantly.',
            }
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
                description: 'Tasks that are part of this workflow stage.',
            },
            owner: {
                type: 'GuidedWorkflow',
                cardinality: 1,
                description: 'The workflow that this stage belongs to.',
            }
        },
        statenet: {
            Init: {
                description: "Initial state of the stage, before any tasks have been started.",
                events: {
                    start: {
                        InProgress: { }
                    }
                }
            },
            InProgress: {
                description: "The stage is actively running, executing tasks sequentially.",
                events: {
                    taskCompleted: {
                        InProgress: {
                            // Condition: Check if all tasks are completed
                            condition: function (stage) {
                                return !stage.tasks.every(task => task.state === 'Completed');
                            },
                            action: function (stage, task) {
                                console.log(`Task '${task.name}' completed for stage '${stage.name}'.`);
                            }
                        },
                        Completed: {
                            // Condition: All tasks are completed and objective is met
                            condition: function (stage) {
                                return (
                                    stage.tasks.every(task => task.state === 'Completed') &&
                                    stage.validateObjective()
                                );
                            },
                            action: function (stage) {
                                stage.complete();
                            }
                        },
                        Failed: {
                            // Condition: Tasks are completed but the objective is not met
                            condition: function (stage) {
                                return (
                                    stage.tasks.every(task => task.state === 'Completed') &&
                                    !stage.validateObjective()
                                );
                            },
                            action: function (stage) {
                                stage.fail();
                                console.log(`Stage '${stage.name}' failed to meet objective.`);
                            }
                        }
                    },
                    fail: {
                        Failed: {
                            action: function (stage) {
                                stage.fail();
                                console.log(`Stage '${stage.name}' has failed.`);
                            }
                        }
                    }
                }
            },
            Waiting: {
                description: "Optional state where the stage is waiting for external dependencies or input.",
                events: {
                    resume: {
                        InProgress: {
                            action: function (stage) {
                                stage.resume();
                                console.log(`Stage '${stage.name}' resumed from waiting.`);
                            }
                        }
                    },
                    fail: {
                        Failed: {
                            action: function (stage) {
                                stage.fail();
                                console.log(`Stage '${stage.name}' failed while waiting.`);
                            }
                        }
                    }
                }
            },
            Completed: {
                description: "Final state if all tasks are completed and the objective is met.",
                events: {
                    reset: {
                        Init: { }
                    }
                },
                actions: {
                    entry: {
                        notifyWorkflow: function (obj) { obj.owner.completeStage({stage:obj}); }
                    }
                }
            },
            Failed: {
                description: "End state for the stage if it fails due to errors or unmet objectives.",
                events: {
                    reset: {
                        Init: { }
                    }
                },
                actions: {
                    entry: {
                        notifyWorkflow: function (obj) { obj.owner.failedStage({stage:obj}); }
                    }
                }
            }
        }
    }
}

module.exports = WorkflowStage;