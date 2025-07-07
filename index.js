const fs = require('fs');
const path = require('path');
// const AOVMS = require('ailtire/src/AI/AOVMS.js');
const AOpenAI = require('ailtire/src/AI/AOpenAI.js');
const AOLlama = require('ailtire/src/AI/AOLlama.js');
// Check for node_modules directory. If it exists then continue. If not ask to run npm install.
if(!fs.existsSync('./node_modules')) {
    console.error('Error: you must run "npm install" first');
    return;
}
const server = require('ailtire');

let host = process.env.AILTIRE_HOST || 'localhost';
let port = process.env.AILTIRE_PORT || 3001;
let urlPrefix = process.env.AITIRE_BASEURL || '/web';
let config = {
    baseDir: '.',
    host: host,
    urlPrefix: urlPrefix,
    listenPort: port,
    internalURL: `${host}:${port}${urlPrefix}`,
    routes: {},
    ai: {
        /*
       adaptor: AOpenAI,
        model: 'gpt-4o-mini',
       apiKey: process.env.AILTIRE_OPENAI_KEY,

         */

        /*
        adaptor: AOVMS,
        model: 'model0',
        url: 'http://localhost:8000',
        apiKey: ''
        */

        adaptor: AOLlama,
        model: 'gemma3',
        url: 'http://ollama:11434',
        apiKey: ''
    },
    post: (config) => {
        config.dbDir = config.dbDir || config.baseDir + '/database';
        let dbDir = config.dbDir;
        const gearStr = fs.readFileSync(path.resolve(dbDir, 'gear.json'), 'utf8');
        const gearJSON = JSON.parse(gearStr);
        Layer.fromJSON({layers:gearJSON});

        let partnerDir = path.resolve(dbDir, 'partners');
        let pdir = fs.readdirSync(partnerDir);
        for(let i in pdir) {
            const pfile = path.resolve(partnerDir, pdir[i]);
            const partnerStr = fs.readFileSync(pfile, 'utf8');
            const partnersJSON = JSON.parse(partnerStr);
            Partner.fromJSON({partners: partnersJSON});
        }
        /*
        let guidanceDir = path.resolve(dbDir, 'workflows');
        let gdir = fs.readdirSync(guidanceDir);
        for(let i in gdir) {
            const gfile = path.resolve(guidanceDir, gdir[i]);
            const wfStr = fs.readFileSync(gfile, 'utf8');
            const workflowJSON = JSON.parse(wfStr);
            const workflow = GuidedWorkflow.fromJSON({json: workflowJSON});
            workflow.start();
        }
         */
       /*
        const customerStr = fs.readFileSync('customer.json', 'utf8');
        const customerJSON = JSON.parse(customerStr);
        Customer.fromJSON({customer:customerJSON});

        */

        /*
        const tasksStr = fs.readFileSync('tasks.json', 'utf8');
        const tasksJSON = JSON.parse(tasksStr);
        Task.fromJSON({tasks:tasksJSON});

         */
    }
};
server.listen( config);
