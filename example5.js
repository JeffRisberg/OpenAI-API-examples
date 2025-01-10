const OpenAI = require("openai");

const openai = new OpenAI()

async function main() {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant producce a document like:.Product Requirement Doc <Initiative name> ..Ver 1(DRAFT)\n" +
                    "Ver 1\n" +
                    "* 1 Overview:\n" +
                    "* 2 Use Stories:\n" +
                    "o 2.1 User story 1:\n" +
                    "o 2.2 User Story 2:\n" +
                    "* 3 Scope:\n" +
                    "* 4 Product Requirements:\n" +
                    "o 4.1 <Requirement 1> e.g. Search ranking:\n" +
                    "o 4.2 <Requirement 2> Search Indexing:\n" +
                    "o 4.3 <Requirement 3> Automated Search Jobs:\n" +
                    "* 5 Risks\n" +
                    "* 6 Dependencies\n" +
                    "* 7 Success criteria:\n" +
                    "* 8 Initiative details:\n" +
                    "* 9 Document Versioning & Approvals:\n" +
                    "* 10 Appendix:\n" +
                    "\n" +
                    "Overview:\n" +
                    "Use this section to set the background for the initiative\n" +
                    "Use Stories:\n" +
                    "This is a collection of users stories mentioned below.\n" +
                    "User story 1:\n" +
                    "Describe a user story from the user point of view. Explain the persona, why and how the persona will use this feature.\n" +
                    "User Story 2:\n" +
                    "\n" +
                    "Scope:\n" +
                    "Identify scope of the PRD . e.g.: Scope if this PRD is following sources Share-point, Confluence,. Also identify out of scope details. e.g. This PRD does not apply to documents stored in systems that do not have an API endpoint.\n" +
                    "Product Requirements:\n" +
                    "Pl ensure that the requirements cover functional (behavior) and non functional (latency, retention period, security, languages supported, etc.) requirements.\n" +
                    "<Requirement 1> e.g. Search ranking:\n" +
                    "Describe the requirement . Pl state the purpose, assumptions, inputs, behavior, output and success criteria for that functionality, as applicable. E.g. This functionality helps rank search results across various fulfillment types, and created a stank ranked heterogenous list of fulfillments. Inputs to this algorithm are … , Assumption is that only confluence documents and ServiceNow SC will be ingested, the algorithm should consider the entire document and not just the title .. the output should be a stacked rank of documents and SCs, with confidence levels normalized across all sources, the success of this algorithm should be tested by comparing with resolved tickets where multiple fulfillments were available in current tenants.\n" +
                    "<Requirement 2> Search Indexing:\n" +
                    "<Requirement 3> Automated Search Jobs:\n" +
                    "\n" +
                    "Risks\n" +
                    "Identify scenarios that could make these requirements risky. E.g. >X TB data set\n" +
                    "\n" +
                    "Dependencies\n" +
                    "Identify dependencies at a high level\n" +
                    "\n" +
                    "Success criteria:\n" +
                    "How would our customer measure overall success of these requirements: E.g. Algorithm should be able to process 5K Documents and 300 SC with 1000 items per catalog in X sec. When compared with successfully resolved requests in our tenants where multiple fulfillments were possible, The algorithm’s suggestion should have a success rate of 90%\n" +
                    "\n" +
                    "Initiative details:\n" +
                    "Product Area\n" +
                    "\n" +
                    "Business Objectives:\n" +
                    "\n" +
                    "Product Manager:\n" +
                    "\n" +
                    "Technical Lead\n" +
                    "\n" +
                    "Data Science Lead\n" +
                    "\n" +
                    "QA Lead\n" +
                    "\n" +
                    "Program Lead\n" +
                    "\n" +
                    "Document Versioning & Approvals:\n" +
                    "Document Version\n" +
                    "Description / Comments\n" +
                    "Approved by (PM Director)\n" +
                    "Approved by (Dev Director)\n" +
                    "Approved by (QA Director)\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "Appendix:\n" +
                    "Add any additional content that may not fit in above sections\n"

            },
            {
                role: "assistant",
                content: "to file a TPS report, you must run simulations, gather information, and write the document.",
            },
            {
                role: "user",
                content: "here is the text of the document:.",
            }
        ],
    });

    console.log(response.status);
    console.log(response.choices[0].message);
}

main()
