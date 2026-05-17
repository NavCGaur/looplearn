const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.questions.forEach((q, i) => {
    const correctIdx = q.options.findIndex(opt => opt.is_correct);
    console.log(`[${i}] ${q.question_text}`);
    if (correctIdx === -1) {
        console.log(`  !! NO CORRECT OPTION !!`);
    } else {
        console.log(`  Correct [${correctIdx}]: ${q.options[correctIdx].option_text}`);
    }
});
