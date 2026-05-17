const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.questions.forEach((q, i) => {
    const corrects = q.options.filter(opt => opt.is_correct);
    console.log(`[${i}] ${q.question_text}`);
    if (corrects.length === 0) {
        console.log(`  !! NO CORRECT OPTION !!`);
    } else if (corrects.length > 1) {
        console.log(`  !! MULTIPLE CORRECT OPTIONS !!`);
    } else {
        console.log(`  Correct: ${corrects[0].option_text}`);
    }
});
