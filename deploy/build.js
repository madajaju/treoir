
module.exports = {
    web: {
        dir: '..',
        file: 'deploy/web/Dockerfile',
        tag: 'gear_web',
        env: {
        }
    },
    backend: {
        dir: '..',
        file: 'deploy/backend/Dockerfile',
        tag: 'gear_backend',
        env: {
        }
    },
    ollama: {
        dir: '..',
        file: 'deploy/ollama/Dockerfile',
        tag: 'gear_ollama',
        env: {
        }
    },
    ov_ollama: {
        dir: '..',
        file: 'deploy/ov_ollama/Dockerfile',
        tag: 'gear_ov_ollama',
        env: {
        }
    }
}
