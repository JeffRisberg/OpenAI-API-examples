const fs = require("fs");
const OpenAI = require("openai");

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
        const revenue_file = await openai.files.create({
            file: fs.createReadStream("revenue-forecast.csv"),
            purpose: "assistants",
        });

        const assistant = await openai.beta.assistants.create({
            name: "Financial Advisor",
            instructions: "You are a financial wizard.  You can review csv files and generate trends.",
            tool_resources: {
                "code_interpreter": {
                    "file_ids": [revenue_file.id]
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
                "content": "Create a chart of revenue by years."
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
                console.log(`${message.role} > ${content0.text.value}`);
            }
            if (content0.image_file != undefined) {
                const file_id = content0.image_file.file_id;
                console.log(`${message.role} > ${file_id}`);

                const response = await openai.files.content(file_id);

                // Extract the binary data from the Response object
                const image_data = await response.arrayBuffer();

                // Convert the binary data to a Buffer
                const image_data_buffer = Buffer.from(image_data);

                // Save the image to a specific location
                fs.writeFileSync(`./my-${file_id}-image.png`, image_data_buffer);
            }
        }
    } catch
        (error) {
        console.error(error);
    }
}

main()
