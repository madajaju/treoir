
module.exports = {
    web: {
        dir: '..',
        file: 'deploy/web/Dockerfile',
        tag: 'paidar/gear_web',
        env: {
        }
    },
    backend: {
        dir: '..',
        file: 'deploy/backend/Dockerfile',
        tag: 'paidar/gear_backend',
        env: {
        }
    },
    ollama: {
        dir: '..',
        file: 'deploy/ollama/Dockerfile',
        tag: 'paidar/gear_ollama',
        env: {
        }
    },
    ov_ollama: {
        dir: '..',
        file: 'deploy/ov_ollama/Dockerfile',
        tag: 'paidar/gear_ov_ollama',
        env: {
        }
    }
}
