const OpenAI = require("openai");

const openai = new OpenAI()

async function main() {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that provides short answers about office reports."
            },
            {
                role: "assistant",
                content: "to file a TPS report, you must run simulations, gather information, and write the document.",
            },
            {
                role: "user",
                content: "The simulation results of the Alpha project shows positive results.",
            },
            {
                role: "user",
                content: "What should I do next to complete my TPS report.",
            },
        ],
    });

    console.log(response.status);
    console.log(response.choices[0].message);
}

main()
