const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fixes = [
    { index: 0, correctIndex: 2 }, // Q1: We see different portions...
    { index: 1, correctIndex: 1 }, // Q2: 29.5 days
    { index: 6, correctIndex: 2 }, // Q7: Revolution of Earth...
    { index: 7, correctIndex: 1 }, // Q8: An extra month...
    { index: 9, correctIndex: 2 }, // Q10: Due to its orbital position...
    { index: 14, correctIndex: 1 }, // Q15: Southward journey...
    { index: 20, correctIndex: 1 }, // Q21: The tides would be much more complex
    { index: 22, correctIndex: 1 }, // Q23: The 50-minute daily shift...
    { index: 24, correctIndex: 1 }  // Q25: It does not stay in sync...
];

fixes.forEach(fix => {
    const q = data.questions[fix.index];
    q.options.forEach((opt, i) => {
        opt.is_correct = (i === fix.correctIndex);
        opt.explanation = opt.is_correct ? 'Correct!' : null;
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Fixed answers for Batch 14.');
