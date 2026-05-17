const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');

try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    if (!data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid JSON structure. Expected "questions" array at root.');
        process.exit(1);
    }

    const questions = data.questions;
    console.log(`Total questions found: ${questions.length}`);

    const requiredFields = [
        'question_text', 'question_type', 'class_standard', 'subject', 'chapter',
        'difficulty', 'points', 'is_active', 'answer_explanation'
    ];

    let missingFieldsCount = 0;
    let invalidTypeCount = 0;

    questions.forEach((q, index) => {
        requiredFields.forEach(field => {
            if (q[field] === undefined || q[field] === null || q[field] === '') {
                console.error(`Question ${index + 1} missing required field: ${field}`);
                missingFieldsCount++;
            }
        });

        if (!['mcq', 'fillblank', 'truefalse'].includes(q.question_type)) {
            console.error(`Question ${index + 1} has invalid question_type: ${q.question_type}`);
            invalidTypeCount++;
        }

        if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
            if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                console.error(`Question ${index + 1} (${q.question_type}) has invalid options`);
                missingFieldsCount++;
            }
        }

        if (q.question_type === 'fillblank') {
            if (!q.fillblank_answers || !Array.isArray(q.fillblank_answers) || q.fillblank_answers.length === 0) {
                console.error(`Question ${index + 1} (fillblank) has invalid fillblank_answers`);
                missingFieldsCount++;
            }
        }
    });

    console.log('\n--- Validation Summary ---');
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Missing/Navlid Fields: ${missingFieldsCount}`);
    console.log(`Invalid Question Types: ${invalidTypeCount}`);

    if (missingFieldsCount === 0 && invalidTypeCount === 0) {
        console.log('\nValidation PASSED. Data is ready for insertion.');
    } else {
        console.log('\nValidation FAILED. Please fix errors before inserting.');
    }

} catch (e) {
    console.error('Error reading/parsing JSON:', e.message);
}
