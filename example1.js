const OpenAI = require("openai");

const openai = new OpenAI()

async function main() {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {role: "system", content: "You are a helpful assistant."},
            {
                role: "user",
                content: "Create three paragraphs about dogs for a middle school reader.",
            },
        ],
    });

    console.log(response.status);
    console.log(response.choices[0].message);
}

main()
