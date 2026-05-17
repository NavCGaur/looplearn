const fs = require('fs');

const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let errors = 0;
let modified = false;

data.questions.forEach((q, i) => {
    // 1. Change physics to science
    if (q.subject !== 'science') {
        q.subject = 'science';
        modified = true;
    }

    // 2. Validate required question fields
    const required = ['question_text', 'question_type', 'class_standard', 'subject', 'chapter', 'difficulty'];
    required.forEach(field => {
        if (!q[field]) {
            console.error(`[Q${i}] Missing required field: ${field}`);
            errors++;
        }
    });

    // 3. Check question types and structure
    if (!['mcq', 'fillblank', 'truefalse'].includes(q.question_type)) {
        console.error(`[Q${i}] Invalid question type: ${q.question_type}`);
        errors++;
    }

    // 4. Validate explanations
    if (!q.answer_explanation || q.answer_explanation.trim() === '') {
        console.warn(`[Q${i}] Missing question-level answer_explanation!`);
        // Maybe some error handling depending on strictness
    }

    // 5. Validate options based on type
    if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
        if (!q.options || q.options.length < 2) {
            console.error(`[Q${i}] Missing or insufficient options for ${q.question_type}`);
            errors++;
        } else {
            let correctCount = 0;
            q.options.forEach((opt, j) => {
                if (opt.is_correct) correctCount++;
                if (!opt.option_text) {
                    console.error(`[Q${i}][Opt${j}] Missing option_text`);
                    errors++;
                }
                // Check if option explanation exists
                if (opt.explanation === undefined) {
                    console.warn(`[Q${i}][Opt${j}] Missing option-level explanation. This might be why wrong answers don't show explanations.`);
                }
            });
            if (correctCount !== 1) {
                console.error(`[Q${i}] Found ${correctCount} correct options (expected 1).`);
                errors++;
            }
        }
    } else if (q.question_type === 'fillblank') {
        if (!q.fillblank_answers || q.fillblank_answers.length === 0) {
            console.error(`[Q${i}] Missing fillblank_answers`);
            errors++;
        }
    }
});

if (modified) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
    console.log('Modified subject to "science" and saved file.');
}

console.log(`\nValidation complete. Total questions: ${data.questions.length}`);
console.log(`Total errors found: ${errors}`);

if (errors === 0) {
    console.log('Data is SUITABLE for insertion.');
} else {
    console.log('Data REQUIRES FIXES before insertion.');
}
