import LlamaAI from 'llamaai';

const apiToken = process.env.LLAMAAI_API_KEY;

const llamaAPI = new LlamaAI(apiToken, 'https://dev6.api.aws-006-us-west-2.aisera.cloud/llama8/v1');

async function main() {
    const apiRequestJson = {
        "model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
        "messages": [
            {role: "system", content: "You are a helpful assistant."},
            {
                "role": "user",
                "content": "Create three paragraphs about dogs for a middle school reader."
            },
        ],
        "stream": false,
    }

    // Execute the Request
    llamaAPI.run(apiRequestJson)
        .then(response => {
            // Process response
            console.log(response.status);
            console.log(response.choices[0].message);
        })
        .catch(error => {
            // Handle errors
            console.log(error);
        });
}

main()
