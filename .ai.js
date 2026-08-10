const AOpenAI = require('ailtire/src/AI/AOpenAI.js');
const AOllama = require('ailtire/src/AI/AOllama.js');


module.exports = {
    OpenAI: {
        adaptor: AOpenAI,
        models: [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4o-mini',
            'gpt-5',
            'gpt-5-mini',
            'gpt-5-nano',
            'o1',
            'o3-mini'
        ]
    },
    Ollama: {
        adaptor: AOllama,
        models: [
            'llama3.1',
            'llama3.2',
        ]
    },
}