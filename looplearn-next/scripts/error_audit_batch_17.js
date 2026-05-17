const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = data.questions;

console.log(`Auditing ${questions.length} questions for errors...`);

questions.forEach((q, index) => {
    const correctOptions = q.options.filter(o => o.is_correct);

    if (correctOptions.length !== 1) {
        console.error(`[Q${index + 1}] Error: ${correctOptions.length} correct answers found.`);
        console.log(`   Question: ${q.question_text.substring(0, 60)}...`);
        console.log(`   Explanation: ${q.answer_explanation}`);
        console.log(`   Options: ${q.options.map(o => o.option_text).join(' | ')}`);
        console.log('---');
    }
});

console.log("Audit complete.");
