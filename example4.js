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


function get_student_name(id) {
    params = {'id': id}
    if (id == 14) {
        return "Alex DeLarge";
    } else {
        return "Frodo Baggins";
    }
}

async function main() {
    var conversationalHistory = []
    var messages = []

    messages.push(
        {
            role: "system",
            content: "You are a helpful assistant. Only show the top 3 of any list."
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

        // Polling mechanism to see if runStatus is completed
        // This should be made more robust.
        while (true) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages,
                tools: [
                    {
                        "type": "function", "function": {
                            "name": "get_student_name",
                            "description": "Get name of a student given an id",
                            "parameters": {
                                "type": "object", "properties": {
                                    "id": {
                                        "type": "integer", "description": "Id of student"
                                    }
                                },
                                "required": ["id"],
                                "additionalProperties": false
                            }
                        }
                    }],
            });

            const message = response.choices[0].message
            const tool_calls = message.tool_calls;

            if (tool_calls == null || tool_calls.length == 0) {
                console.log(response.choices[0].message);
                break;
            } else {
                //console.log("start tool calls")
                messages.push(message)

                for (const tool_call of tool_calls) {
                    console.log(tool_call)
                    if (tool_call.function.name == "get_student_name") {
                        const args = JSON.parse(tool_call.function.arguments)
                        //console.log(args);
                        const id = args.id;
                        //console.log(id);
                        const name = get_student_name(id);
                        //console.log(name)

                        // Create a message containing the result of the function call
                        const function_call_result_message = {
                            role: "tool",
                            content: JSON.stringify({
                                name: name
                            }),
                            tool_call_id: tool_call.id
                        };
                        messages.push(function_call_result_message);
                    }
                }
                //console.log("completed tool calls")
            }
        } // inner while
        userQuestion = await askQuestion("\nHow else can I help you? ");
    } // outer while
}

main();
