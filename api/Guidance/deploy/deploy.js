
module.exports = {
    name: '_w',
    contexts: {
        local: {
            type: 'swarm',
            tag: '_w_dev',
            design: 'services.js',
            env: {}
        },
        dev: {
            type: 'swarm',
            tag: '_w_dev',
            design: 'services.js',
            env: {}
        },
        test: {
            type: 'swarm',
            tag: '_w_test',
            design: 'services.js',
            file: 'docker-compose.yml',
            env: {}
        },
        prod: {
            type: 'swarm',
            tag: '_w_prod',
            design: 'services.js',
            env: {}
        }
    }
}
