import { pipeline, env } from "@xenova/transformers";

// Disable local models
env.allowLocalModels = false;

class MyTranslationPipeline {
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance = null;



    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }

        return this.instance;
    }
}

// self.addEventListener('message', async (event) => {
//     try {
//         const response = await fetch('https://huggingface.co/Xenova/nllb-200-distilled-600M/resolve/main/config.json');
//         const text = await response.text();
//         console.log('Response:', text);
//         self.postMessage({ result: 'Fetch successful', text: text });
//     } catch (error) {
//         console.error('Fetch error:', error);
//         self.postMessage({ error: error.message });
//     }
// });

self.addEventListener('message', async (event) => {
    let translator = await MyTranslationPipeline.getInstance(x => {
        self.postMessage(x)
    })

    let output = await translator(event.data.text, {
        tgt_lang: event.data.tgt_lang,
        src_lang: event.data.srv_lang,

        callback_function: x => {
            self.postMessage({
                status: 'update',
                output: translator.tokenizer.decode(x[0].output_token_ids, 
                    { skip_special_tokens: true })
            })
        }
    })

    self.postMessage({
        status:'complete',
        output
    })


})