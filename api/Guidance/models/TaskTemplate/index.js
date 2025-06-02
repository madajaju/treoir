class TaskTemplate {
    static definition = {
        name: 'TaskTemplate',
        description: 'Generalized template for a task that can be instantiated dynamically.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the task template (e.g., Validate Layer Definitions).',
            },
            objective: {
                type: 'string',
                description: 'What this task is intended to accomplish.',
            },
            inputFormat: {
                type: 'json',
                description: 'Generalized format for the task inputs.',
            },
            outputFormat: {
                type: 'json',
                description: 'Expected format of the outputs.',
            },
            guidance: {
                type: 'string',
                description: 'Instructions or prompts to guide the solution architect.',
            }
        },
        associations: {
            workflow: {
                type: 'GuidedWorkflow',
                cardinality: 1,
                description: 'The workflow that this template belongs to.',
            }
        }
    }
}

module.exports = TaskTemplate;