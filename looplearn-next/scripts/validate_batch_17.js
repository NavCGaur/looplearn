const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = data.questions;

let errorCount = 0;
let modifiedCount = 0;

questions.forEach((q, index) => {
    // 1. Check/Fix subject (ensure it's science)
    if (q.subject === 'physics') {
        q.subject = 'science';
        modifiedCount++;
    }

    // 2. Validate field names
    const requiredFields = [
        'question_text', 'question_type', 'class_standard',
        'subject', 'chapter', 'difficulty', 'points',
        'is_active', 'answer_explanation'
    ];

    requiredFields.forEach(field => {
        if (q[field] === undefined || (typeof q[field] === 'string' && q[field].trim() === '')) {
            console.error(`[Q${index}] Missing or empty field: ${field}`);
            errorCount++;
        }
    });

    if (q.answer_explanation && q.answer_explanation.length < 10) {
        console.warn(`[Q${index}] Warning: Short answer_explanation (${q.answer_explanation.length} chars)`);
    }

    // 3. Validate types
    if (!['mcq', 'fillblank', 'truefalse'].includes(q.question_type)) {
        console.error(`[Q${index}] Invalid question_type: ${q.question_type}`);
        errorCount++;
    }

    // 4. Validate Options / Answers
    if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
        if (!q.options || q.options.length === 0) {
            console.error(`[Q${index}] MCQ/TrueFalse missing options`);
            errorCount++;
        } else {
            let correctCount = 0;
            q.options.forEach((opt, optIndex) => {
                if (opt.is_correct) correctCount++;
                if (opt.option_text === undefined || opt.option_text.trim() === '') {
                    console.error(`[Q${index}][Opt${optIndex}] Missing or empty option_text`);
                    errorCount++;
                }
            });
            if (correctCount !== 1) {
                console.error(`[Q${index}] MCQ/TrueFalse must have exactly 1 correct answer (Found ${correctCount})`);
                errorCount++;
            }
        }
    } else if (q.question_type === 'fillblank') {
        if (!q.fillblank_answers || q.fillblank_answers.length === 0) {
            console.error(`[Q${index}] fillblank missing answers`);
            errorCount++;
        }
    }
});

if (modifiedCount > 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4));
    console.log(`Updated subject from physics to science for ${modifiedCount} questions.`);
}

console.log(`Validation complete for ${questions.length} questions.`);
console.log(`Total errors found: ${errorCount}`);

if (errorCount === 0) {
    console.log("READY_FOR_INSERTION");
} else {
    console.log("FIX_ERRORS_FIRST");
}
