const fs = require('fs');
const AOpenAI = require('ailtire/src/AI/AOpenAI.js');
const AOLlama = require('ailtire/src/AI/AOLlama.js');
// Check for node_modules directory. If it exists then continue. If not ask to run npm install.
if(!fs.existsSync('./node_modules')) {
    console.error('Error: you must run "npm install" first');
    return;
}
const server = require('ailtire');

let host = process.env.AILTIRE_HOST || 'localhost';
let port = process.env.AILTIRE_PORT || 80;
let urlPrefix = process.env.AITIRE_BASEURL || '/web';
let config = {
    baseDir: '.',
    host: host,
    urlPrefix: urlPrefix,
    listenPort: port,
    internalURL: `${host}:${port}${urlPrefix}`,
    routes: {},
    ai: {
       adaptor: AOpenAI,
        model: 'gpt-4o-mini',
       apiKey: process.env.AILTIRE_OPENAI_KEY,
        /*
        adaptor: AOLlama,
        model: 'llama3.2',
        url: 'http://localhost:11434',
        apiKey: ''

         */
    },
    post: (config) => {
        const gearStr = fs.readFileSync('gear.json', 'utf8');
        const gearJSON = JSON.parse(gearStr);
        Layer.fromJSON({layers:gearJSON});

        const partnerStr = fs.readFileSync('partners.json', 'utf8');
        const partnersJSON = JSON.parse(partnerStr);
        Partner.fromJSON({partners:partnersJSON});

        const customerStr = fs.readFileSync('customer.json', 'utf8');
        const customerJSON = JSON.parse(customerStr);
        Customer.fromJSON({customer:customerJSON});
        const tasksStr = fs.readFileSync('tasks.json', 'utf8');
        const tasksJSON = JSON.parse(tasksStr);
        Task.fromJSON({tasks:tasksJSON});
    }
};
if(fs.existsSync('.ailtire.js')) {
    let overConfig = require('./.ailtire.js');
    for(let i in overConfig) {
        config[i] = overConfig[i];
    }
} else {
    let outputString = `module.exports = ${JSON.stringify(config)};`;
    fs.writeFileSync('.ailtire.js', outputString, 'utf8');
}
server.listen( config);
