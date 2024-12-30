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


function get_student_name(id) {
    // Replace with your actual endpoint
    // url = "http://your_api_endpoint/order_info"
    params = {'id': id}
    // response = requests.post(url, params=params)

    // if response.status_code == 200:
    //  return response.json()['Result'][0]
    // else:
    //  return f"Error: Unable to fetch order details. Status code: {response.status_code}"
    if (id == 14) {
        return "Alex DeLarge";
    } else {
        return "Frodo Baggins";
    }
}

async function main() {
    try {
        const assistant = await openai.beta.assistants.create({
            name: "College Application Advisor",
            instructions: "You are a college advisor to high school students.  Only show the top 3 of any list.",
            tool_resources: {
                "code_interpreter": {
                    "file_ids": [salary_file.id, revenue_file.id]
                }
            },
            tools: [
                {"type": "code_interpreter"},
                {
                    "type": "function", "function": {
                        "name": "get_student_name", "description": "Get name of a student given an id", "parameters": {
                            "type": "object", "properties": {
                                "id": {
                                    "type": "integer", "description": "Id of student"
                                }
                            }, "required": ["id"]
                        }
                    }
                }],
            model: "gpt-4o"
        });

        // Create a thread
        const thread = await openai.beta.threads.create();

        prior_info = "You can find internships by going to https://simplify.jobs/l/Internships-in-SF-Bay-Area"
        await openai.beta.threads.messages.create(thread.id, {
            role: "user", content: prior_info,
        });

        prior_info = "There are ecologist internships available at Gilead.  See Intern – Clinical Project Assistant\n" +
            "Clinical Operations, Oncology. The link is https://simplify.jobs/p/d9abe85e-c461-47de-962a-2b29ac1b2e08/Intern--Clinical-Project-Assistant"
        await openai.beta.threads.messages.create(thread.id, {
            role: "user", content: prior_info,
        });

        // Post the first greeting
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

            // Polling mechanism to see if runStatus is completed
            // This should be made more robust.
            while (true) {
                const polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);

                if (polledRun.status === 'completed') {
                    break;
                }
                if (polledRun.status === 'requires_action') {
                    const tool_calls = polledRun.required_action

                    if (tool_calls != null) {
                        console.log("begin processing actions")
                        const tool_outputs = []

                        for (const tool_call of polledRun.required_action.submit_tool_outputs.tool_calls) {
                            console.log(tool_call)
                            if (tool_call.function.name === "get_student_name") {
                                //console.log(tool_call.function.arguments)
                                const args = JSON.parse(tool_call.function.arguments)
                                //console.log(args);
                                const id = args.id
                                //console.log(id)
                                const name = get_student_name(id);
                                //console.log(name)
                                tool_outputs.push({
                                    "tool_call_id": tool_call.id,
                                    "output": name
                                })
                                //console.log(tool_outputs);

                                openai.beta.threads.runs.submitToolOutputs(
                                    thread.id,
                                    run.id,
                                    {"tool_outputs": tool_outputs}
                                )
                                polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                                while (polledRun.status === 'queued') {
                                    await new Promise((resolve) => setTimeout(resolve, 100));
                                    polledRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                                }
                            }
                        }
                        console.log("end processing actions");
                    }
                }

                // Wait for 0.5 seconds then check again
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.log("thinking...")
            }

            // Get the messages from the thread
            const messages = await openai.beta.threads.messages.list(thread.id);

            // Find the last assistant message for the current run
            const lastMessageForRun = messages.data
                .filter((message) => message.run_id === run.id && message.role === "assistant")
                .pop();

            // If an assistant message is found, console.log() it
            if (lastMessageForRun) {
                console.log(`${lastMessageForRun.content[0].text.value}`);
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
