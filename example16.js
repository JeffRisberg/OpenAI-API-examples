const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI()

const readline = require("readline").createInterface({
    input: process.stdin, output: process.stdout,
});

async function askQuestion(question) {
    return new Promise((resolve, reject) => {
        readline.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    try {
        let phone_number = "650-555-1212";
        try {
            phone_number = process.argv[2];
        } catch (error) {
        }
        console.log(phone_number);

        const assistant_name = "Example16 Assistant";
        let assistant = null;
        let thread;

        // Poll the assistants
        const myAssistants = await openai.beta.assistants.list({
            order: "desc"
        });

        for (const myAssistant of myAssistants.data) {
            if (myAssistant.name === assistant_name) {
                assistant = myAssistant;
            }
        }

        if (assistant == undefined || assistant == null) {
            console.log("Creating assistant")
            assistant = await openai.beta.assistants.create({
                name: assistant_name,
                instructions: "You are a personal math tutor. Write and run code to answer math questions.",
                tools: [{type: "code_interpreter"}],
                model: "gpt-4o"
            });
        }

        // Get the thread information from the metadata of the assistant
        let thread_id_map_str = assistant.metadata['thread_id_map']

        if (thread_id_map_str == undefined || thread_id_map_str == null) {
            thread_id_map_str = '{}'
        }
        const thread_id_map = JSON.parse(thread_id_map_str)
        const thread_id = thread_id_map[phone_number]

        if (thread_id == undefined || thread_id == null) {
            console.log("Creating thread")
            thread = await openai.beta.threads.create();

            // Record the thread id
            thread_id_map[phone_number] = thread.id;

            // Update the assistant with the new thread_id_map
            console.log("Recording thread")
            const myUpdatedAssistant = await openai.beta.assistants.update(
                assistant.id,
                {
                    metadata: {'thread_id_map': JSON.stringify(thread_id_map)}
                }
            )
        } else {
            thread = await openai.beta.threads.retrieve(thread_id);
        }

        // Post the first greeting
        var userQuestion = await askQuestion("\nHello there, I am a financial wizard. How can I help you?\n");

        // Use keepAsking as state for keep asking questions
        let keepAsking = true;
        while (keepAsking) {
            // Pass in the user question into the thread
            await openai.beta.threads.messages.create(thread.id, {
                role: "user", content: userQuestion,
            });

            // Use runs to wait for the assistant response and then retrieve it
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistant.id,
            });

            // Polling mechanism to see if runStatus is completed
            // This should be made more robust.
            while (true) {
                const polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);

                if (polledRun.status === 'completed') {
                    break;
                }

                // Wait for 0.5 seconds then check again
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.log("thinking...")
            }

            // Get the messages from the thread
            const messages = await openai.beta.threads.messages.list(thread.id);

            // Find the last assistance message for the current run
            const lastMessageForRun = messages.data
                .filter((message) => message.run_id === run.id && message.role === "assistant")
                .pop();

            // If an assistant message is found, console.log() it
            if (lastMessageForRun) {
                console.log(`${lastMessageForRun.content[0].text.value} \n`);
            }

            // Ask for the next question
            userQuestion = await askQuestion("\nHow else can I help you? ");
        }

        // close the readline
        readline.close();
    } catch (error) {
        console.error(error);
    }
}

main()
