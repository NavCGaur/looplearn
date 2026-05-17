const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
let content = fs.readFileSync(jsonPath, 'utf8');

console.log("Original content length:", content.length);

// 1. Remove [cite_start\n        ] style markers
// This regex looks for [cite_start, followed by any whitespace (including newlines), then a closing ]
content = content.replace(/\[cite_start[\s\n]*\]/g, "");

// 2. Just in case there are single [cite_start] on one line
content = content.replace(/\[cite_start\]/g, "");

// Let's also check for any other weird things. 
// The diff showed:
// [cite_start
// ]"explanation"
// This would look like: [cite_start\s+]"explanation"
content = content.replace(/\[cite_start[\s\n]*\]/g, "");

// 3. Fix potential trailing commas or other common paste issues
// (Skipping for now unless it still fails)

fs.writeFileSync(jsonPath, content);
console.log("Repair complete. Content cleaned.");

try {
    JSON.parse(content);
    console.log("SUCCESS: File is now valid JSON.");
} catch (e) {
    console.error("STILL FAILING: JSON parse error:", e.message);
    // Print a snippet around the error if possible
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.error("Error context:", content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 50)));
    }
}
