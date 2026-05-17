const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log('--- Batch 14 Audit ---');
data.questions.forEach((q, i) => {
    const correctOptions = q.options.filter(opt => opt.is_correct);
    if (correctOptions.length !== 1) {
        console.log(`[${i}] ERROR: Found ${correctOptions.length} correct options`);
        console.log(`Question: ${q.question_text}`);
        console.log(`Explanation: ${q.answer_explanation}`);
        q.options.forEach((opt, j) => console.log(`  ${j}: [${opt.is_correct ? 'X' : ' '}] ${opt.option_text}`));
    }
});
