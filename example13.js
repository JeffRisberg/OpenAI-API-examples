const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI()

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

        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
                "role": "user",
                "content": "Create 3 data visualizations based on the trends in this file."
            }
        );

        const run = await openai.beta.threads.runs.create(
            thread.id,
            {assistant_id: assistant.id}
        );

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

        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
            const content0 = message.content[0];

            if (content0.text != undefined) {
                console.log(`${message.role} > ${message.content[0].text.value}`);
            }
            if (content0.image_file != undefined) {
                console.log(`${message.role} > ${message.content[0].image_file}`);
            }
        }
    } catch
        (error) {
        console.error(error);
    }
}

main()
