import fs from 'fs';
import * as readline from "readline";
import LlamaAI from 'llamaai';

const apiToken = process.env.LLAMAAI_API_KEY;

const llamaAPI = new LlamaAI(apiToken, 'https://dev6.api.aws-006-us-west-2.aisera.cloud/llama8/v1');

const readlineI = readline.createInterface({
    input: process.stdin, output: process.stdout,
});

async function askQuestion(question) {
    return new Promise((resolve, reject) => {
        readlineI.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {

    //const template_filename = "template_prd.txt";
    //const document_filename = "document_mfg_defect_tracker.txt";
    const template_filename = "template_trip_report.txt";
    const document_filename = "document_trip_to_boston.txt";
    //const template_filename = "template_medical_process_improvement.txt";
    //const document_filename = "document_new_medicine_notes.txt";

    var template = "";
    var document = "";

    try {
        var data = fs.readFileSync(template_filename, 'utf8');
        template = data.toString();
    } catch (e) {
        console.log('Error:', e.stack);
    }

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
            role: "system",
            content: "You are a helpful assistant." +
                "" +
                " When I ask for formatting a document, use the following structure: " +
                template
        }, {
            role: "user",
            content: "Format the following content according to the template." +
                "Content:" + document
        }
    )

    // Execute the Request
    const response = await llamaAPI.run({
        "model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
        "messages": messages,
        "stream": false,
    });

    console.log(response);
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

        // Execute the Request
        const response = await llamaAPI.run({
            "model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
            "messages": messages,
            "stream": false,
        })

        console.log(response.status);
        console.log(response.choices[0].message.content);

        userQuestion = await askQuestion("\nHow else can I help you? ");
    }
}

main();
