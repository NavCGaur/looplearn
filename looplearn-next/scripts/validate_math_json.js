const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/MATHS_QUESTIONS.json');
try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    let questions = [];
    if (data.questions) {
        questions = data.questions;
        console.log('Structure: Flat "questions" array.');
    } else if (data.formula_quizzes) {
        console.log('Structure: Nested "formula_quizzes" array.');
        data.formula_quizzes.forEach(quiz => {
            if (quiz.questions) {
                questions = questions.concat(quiz.questions);
            }
        });
    } else {
        console.error('Unknown JSON structure. Expected "questions" or "formula_quizzes" at root.');
        process.exit(1);
    }

    console.log(`Total questions found: ${questions.length}`);

    const knownFields = [
        'question_text', 'question_type', 'class_standard', 'subject', 'chapter',
        'difficulty', 'points', 'is_active', 'answer_explanation', 'formula_reference', // formula_reference is known in JSON but maybe not DB
        'options', 'fillblank_answers'
    ];

    const dbFields = [
        'question_text', 'question_type', 'class_standard', 'subject', 'chapter',
        'difficulty', 'points', 'is_active', 'answer_explanation'
    ];

    let missingFieldsCount = 0;
    let extraFieldsCount = 0;
    let missingExplanationCount = 0;
    let invalidTypeCount = 0;

    questions.forEach((q, index) => {
        // Check required fields
        const required = ['question_text', 'question_type', 'subject', 'chapter', 'difficulty', 'points'];
        required.forEach(field => {
            if (!q[field]) {
                console.error(`Question ${index + 1} missing required field: ${field}`);
                missingFieldsCount++;
            }
        });

        // Check answer_explanation
        if (!q.answer_explanation) {
            console.error(`Question ${index + 1} missing answer_explanation`);
            missingExplanationCount++;
        }

        // Check extra fields
        Object.keys(q).forEach(key => {
            if (!dbFields.includes(key) && key !== 'options' && key !== 'fillblank_answers') {
                if (key === 'formula_reference') {
                    // We know about this one, just count it or log once
                } else {
                    console.warn(`Question ${index + 1} has unknown field: ${key}`);
                    extraFieldsCount++;
                }
            }
        });

        // Check options for MCQs
        if (q.question_type === 'mcq' && (!q.options || q.options.length === 0)) {
            console.error(`Question ${index + 1} (MCQ) missing options`);
        }
    });

    console.log('\n--- Validation Summary ---');
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Missing Explanations: ${missingExplanationCount}`);
    console.log(`Missing Required Fields: ${missingFieldsCount}`);
    console.log(`Extra Fields (excluding formula_reference): ${extraFieldsCount}`);

    // Check for formula_reference specifically
    const withReference = questions.filter(q => q.formula_reference).length;
    console.log(`Questions with 'formula_reference': ${withReference} (Note: This column does NOT exist in DB)`);

} catch (e) {
    console.error('Error reading/parsing JSON:', e.message);
}
