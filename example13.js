const OpenAI = require("openai");
const fs = require("fs");

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
        const salary_file = await openai.files.create({
            file: fs.createReadStream("salary-data.csv"),
            purpose: "assistants",
        });
        const revenue_file = await openai.files.create({
            file: fs.createReadStream("revenue-forecast.csv"),
            purpose: "assistants",
        });

        const assistant = await openai.beta.assistants.create({
            name: "Financial Advisor",
            instructions: "You are a financial wizard.  You can review csv files and generate trends.",
            tool_resources: {
                "code_interpreter": {
                    "file_ids": [salary_file.id, revenue_file.id]
                }
            },
            tools: [
                {"type": "code_interpreter"},
                ],
            model: "gpt-4o"
        });

        // Create a thread
        const thread = await openai.beta.threads.create();

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
                let polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);

                if (polledRun.status === 'completed') {
                    break;
                }

                // Wait for 0.5 seconds then check again
                await new Promise((resolve) => setTimeout(resolve, 500));
                polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
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
