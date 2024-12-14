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
        const assistant = await openai.beta.assistants.create({
            name: "College Application Advisor",
            instructions: "You are a college advisor to high school students.  Only show the top 3 of any list.",
            tools: [{type: "code_interpreter"}],
            model: "gpt-4o"
        });

        // Create a thread (later code should create a thread for each student)
        const thread = await openai.beta.threads.create();

        // Log the first greeting
        var userQuestion = await askQuestion("\nHello there, how can I help you?\n");

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

            let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

            // Polling mechanism to see if runStatus is completed
            // This should be made more robust.
            while (runStatus.status !== "completed") {
                // wait for 2 seconds then check again
                await new Promise((resolve) => setTimeout(resolve, 2000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                console.log("waited 2000 ms")
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

            // Then ask if the user wants to ask another question and update keepAsking state
            const continueAsking = await askQuestion("Do you want to ask another question? (yes/no) ");
            keepAsking = continueAsking.toLowerCase() === "yes";

            // If the keepAsking state is falsy show an ending message
            if (!keepAsking) {
                console.log("Alrighty then, I hope you learned something!\n");
            } else {
                userQuestion = await askQuestion("\nHow else can I help you? ");
            }
        }

        // close the readline
        readline.close();
    } catch (error) {
        console.error(error);
    }
}

main()
