const OpenAI = require("openai");

const openai = new OpenAI()

async function main() {
    try {
        const myAssistants = await openai.beta.assistants.list({
            order: "desc"
        });

        for (const assistant of myAssistants.data) {
            const response = await openai.beta.assistants.del(assistant.id)

            console.log(response);
        }
    } catch (error) {
        console.error(error);
    }
}

main();
