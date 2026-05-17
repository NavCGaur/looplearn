const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Only Index 19 was identified by the audit as missing.
// Question: "Does the Moon have its own light?"
// Option index 1: "No, it reflects sunlight"
const q19 = data.questions[19];
if (q19) {
    q19.options.forEach((opt, i) => {
        opt.is_correct = (i === 1);
        opt.explanation = (i === 1) ? 'Correct!' : null;
    });
} else {
    console.error('Question 19 not found');
}

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Fixed Question 19.');

// Final Validation
let faultCount = 0;
data.questions.forEach((q, i) => {
    const correctCount = q.options.filter(opt => opt.is_correct).length;
    if (correctCount !== 1) {
        console.log(`[${i}] Still faulty: ${correctCount} correct options`);
        faultCount++;
    }
});
console.log(`Final fault count: ${faultCount}`);
