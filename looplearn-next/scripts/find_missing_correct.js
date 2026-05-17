const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const questionsWithNoCorrect = data.questions.filter(q => !q.options.some(opt => opt.is_correct));

console.log(`Total questions with NO correct option: ${questionsWithNoCorrect.length}`);
questionsWithNoCorrect.forEach((q, i) => {
    console.log(`\n[${i}] Question: ${q.question_text}`);
    console.log(`Explanation: ${q.answer_explanation}`);
    q.options.forEach((opt, j) => {
        console.log(`  Option ${j}: ${opt.option_text}`);
    });
});
