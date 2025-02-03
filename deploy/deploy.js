
module.exports = {
    name: 'gear',
    contexts: {
        dev: {
            type: 'swarm',
            tag: 'gear_dev',
            file: 'docker-compose.yml',
            env: {}
        },
        test: {
            type: 'swarm',
            tag: 'gear_test',
            file: 'docker-compose.yml',
            env: {}
        },
        prod: {
            type: 'swarm',
            tag: 'gear_prod',
            file: 'docker-compose.yml',
            env: {}
        }
    }
}
