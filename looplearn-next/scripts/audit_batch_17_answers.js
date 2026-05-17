const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = data.questions;

const start = 0; // Adjust this
const end = 25;   // Adjust this
questions.slice(start, end).forEach((q, index) => {
    const qIndex = start + index + 1;
    const correctOptions = q.options.filter(o => o.is_correct);
    const correctTexts = correctOptions.map(o => o.option_text).join(', ');

    console.log(`[Q${qIndex}] ${q.question_text.substring(0, 50)}...`);
    if (correctOptions.length === 1) {
        console.log(`  -> OK: Correct Answer = ${correctTexts}`);
    } else if (correctOptions.length === 0) {
        console.error(`  -> ERROR: NO CORRECT ANSWER FOUND`);
        console.log(`     Explanation: ${q.answer_explanation}`);
        console.log(`     Options: ${q.options.map(o => o.option_text).join(' | ')}`);
    } else {
        console.error(`  -> ERROR: MULTIPLE CORRECT ANSWERS FOUND (${correctOptions.length})`);
        console.log(`     Explanation: ${q.answer_explanation}`);
        console.log(`     Matches: ${correctTexts}`);
    }
});
