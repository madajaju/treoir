
module.exports = {
    web: {
        dir: '..',
        file: 'deploy/web/Dockerfile',
        tag: 'gear_web',
        env: {

        }
    },
    doc: {
        dir: '../docs',
        file: '../deploy/doc/Dockerfile',
        tag: 'gear_doc',
        env: {

        }
    }
}
