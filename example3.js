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
    var conversationalHistory = []
    var messages = []

    messages.push(
        {
            role: "system",
            content: "You are a helpful assistant."
        }
    )

    // Log the first greeting
    var userQuestion = await askQuestion("\nHello there, how can I help you?\n");

    // Main loop
    while (true) {
        conversationalHistory.push(userQuestion)
        messages.push(
            {
                role: "user",
                content: userQuestion
            }
        )

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages
        });

        console.log(response.status);
        console.log(response.choices[0].message);

        userQuestion = await askQuestion("\nHow else can I help you? ");
    }
}

main();
