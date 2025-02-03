
class Task {
    static definition = {
        name: 'Task',
        description: 'Tasks to be performed by the solution architect. ',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the task to get things done',
            },
            status: {
                type: 'string',
                description: 'Status of the task',
            },
            details: {
                type: 'string',
                description: 'Details of the task',
            }
        },
        associations: {
        },
    }
}

module.exports = Task;

