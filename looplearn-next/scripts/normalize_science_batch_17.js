const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// If rawData is an array, wrap it in a "questions" object
const questions = Array.isArray(rawData) ? rawData : rawData.questions;

const normalizedQuestions = questions.map((q, index) => {
    // 1. Normalize field names
    const normalized = {
        question_text: q.question || q.question_text,
        question_type: q.type || q.question_type || 'mcq',
        class_standard: q.classStandard || q.class_standard,
        subject: (q.subject || 'science').toLowerCase(),
        chapter: q['chapter name'] || q.chapter,
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        points: q.points || 10,
        is_active: q.is_active !== undefined ? q.is_active : true,
        answer_explanation: q.explanation || q.answer_explanation || ''
    };

    // 2. Normalize and clean explanation
    if (normalized.answer_explanation) {
        // Remove [cite: ...] markers if present
        normalized.answer_explanation = normalized.answer_explanation.replace(/\[cite:\s*[\d,\s]+\]/g, '').trim();
    }

    // 3. Handle options
    if (q.options && Array.isArray(q.options)) {
        normalized.options = q.options.map((optText, optIndex) => {
            const isMcq = typeof optText === 'string';
            const text = isMcq ? optText : optText.option_text;

            // Heuristic to find the correct answer from the explanation
            let isCorrect = false;
            if (normalized.answer_explanation.toLowerCase().includes(text.toLowerCase())) {
                isCorrect = true;
            }

            return {
                option_text: text,
                display_order: optIndex + 1,
                is_correct: isCorrect,
                explanation: "" // Flat data doesn't have option-specific explanations
            };
        });

        // Safety check: Ensure at least one correct answer is found. 
        // If multiple matches, we might need manual review, but for now we'll log it.
        const correctCount = normalized.options.filter(o => o.is_correct).length;
        if (correctCount === 0) {
            console.warn(`[Q${index}] No correct answer found automatically for: "${normalized.question_text.substring(0, 30)}..."`);
        } else if (correctCount > 1) {
            console.warn(`[Q${index}] Multiple potential correct answers found (${correctCount}) for: "${normalized.question_text.substring(0, 30)}..."`);
        }
    }

    return normalized;
});

const output = { questions: normalizedQuestions };
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 4));

console.log(`Normalization complete! Processed ${normalizedQuestions.length} questions.`);
console.log(`Please audit the file for correct answer flags before insertion.`);
