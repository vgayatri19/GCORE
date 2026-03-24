const typeMap = {
    "TECHNICAL": "TECHNICAL",
    "NON_TECHNICAL": "NON_TECHNICAL",
    "SPORTS": "SPORTS",
    "CULTURAL": "CULTURAL",
    "TECHNICAL_ACHIEVEMENT": "TECHNICAL",
    "NON_TECHNICAL_ACHIEVEMENT": "NON_TECHNICAL"
};

const roleMap = {
    "PARTICIPANT": "PARTICIPANT",
    "WINNER": "WINNER",
    "RUNNER_UP": "RUNNER_UP",
    "ORGANIZER": "ORGANIZER"
};

const categoryMap = {
    "HACKATHON": "HACKATHON",
    "WORKSHOP": "WORKSHOP",
    "INTERNSHIP": "INTERNSHIP",
    "COMPETITION": "COMPETITION",
    "RESEARCH": "RESEARCH",
    "CERTIFICATION": "CERTIFICATION"
};

const normalizeStr = (str) => {
    if (!str) return "";
    return str.toString().trim().toUpperCase().replace(/[\s-]/g, "_");
};

const testCases = [
    { type: "Technical", expected: "TECHNICAL" },
    { type: "Non-Technical", expected: "NON_TECHNICAL" },
    { type: "Sports ", expected: "SPORTS" },
    { role: "Participant", expected: "PARTICIPANT" },
    { role: "Winner", expected: "WINNER" },
    { role: "Runner-up", expected: "RUNNER_UP" },
    { category: "Hackathon", expected: "HACKATHON" },
    { category: "Workshop", expected: "WORKSHOP" },
    { category: "Invalid", expected: "OTHER" }
];

console.log("Starting Normalization Tests...");
testCases.forEach((tc, i) => {
    let result;
    if (tc.type) {
        result = typeMap[normalizeStr(tc.type)] || "OTHER";
    } else if (tc.role) {
        result = roleMap[normalizeStr(tc.role)] || "OTHER";
    } else if (tc.category) {
        result = categoryMap[normalizeStr(tc.category)] || "OTHER";
    }

    if (result === tc.expected) {
        console.log(`Test ${i + 1}: PASSED (${result})`);
    } else {
        console.error(`Test ${i + 1}: FAILED! Expected ${tc.expected}, got ${result}`);
    }
});
