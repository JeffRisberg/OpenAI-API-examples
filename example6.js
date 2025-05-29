const fs = require('fs')
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

    const document_filename = "part_inventory_list.json";

    var document = "";

    try {
        var data = fs.readFileSync(document_filename, 'utf8');
        document = data.toString();
    } catch (e) {
        console.log('Error:', e.stack);
    }

    var conversationalHistory = []
    var messages = []

    messages.push(
        {
            role: "user",
            content: "Use the following content." +
                "Content:" + document
        }
    )

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages
    });

    console.log(response)
    console.log(response.choices[0].message.content);

    // Log the first greeting
    var userQuestion = await askQuestion("\nHow else can I help you?\n");

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

        console.log(response.choices[0].message.content);

        userQuestion = await askQuestion("\nHow else can I help you? ");
    }
}

main();
