
module.exports = {
    name: '_a',
    contexts: {
        local: {
            type: 'swarm',
            tag: '_a_dev',
            design: 'services.js',
            env: {}
        },
        dev: {
            type: 'swarm',
            tag: '_a_dev',
            design: 'services.js',
            env: {}
        },
        test: {
            type: 'swarm',
            tag: '_a_test',
            design: 'services.js',
            file: 'docker-compose.yml',
            env: {}
        },
        prod: {
            type: 'swarm',
            tag: '_a_prod',
            design: 'services.js',
            env: {}
        }
    }
}
