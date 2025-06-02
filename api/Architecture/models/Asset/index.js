
class Asset {
    static definition = {
        name: 'Asset',
        description: 'This is a link to external documentation about an item in the architecture. This could be a link to a website, a link to a document, a link to a video, etc.',
        attributes: {
            name: {
                type: 'string',
                description: 'Name of the asset.'
            },
            url: {
                type: 'string',
                description: 'URL of the asset.'
            },
            description: {
                type: 'string',
                description: 'Description of the asset.'
            },
        },
        associations: {
        },
    }
}

module.exports = Asset;

