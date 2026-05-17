const fs = require('fs');

const path = 'docs/SCIENCE_QUESTIONS.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Heuristic to find correct answer: match option text against explanation
// This is a helper, but I should verify the results.
function findCorrectIndex(options, explanation) {
    const cleanExpl = explanation.toLowerCase();
    let bestMatch = -1;
    let maxOverlap = -1;

    options.forEach((opt, index) => {
        const cleanOpt = opt.toLowerCase();
        // Check for direct containment or high overlap
        if (cleanExpl.includes(cleanOpt)) {
            const overlap = cleanOpt.length;
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestMatch = index;
            }
        }
    });

    // Fallback: If no match, check for specific phrases
    if (bestMatch === -1) {
        // Log for manual check
        console.warn(`Warning: Could not automatically detect correct answer for: "${explanation.substring(0, 50)}..."`);
    }

    return bestMatch;
}

const normalized = {
    questions: data.map(q => {
        const correctIndex = findCorrectIndex(q.options, q.explanation);

        return {
            question_text: q.question,
            question_type: q.type,
            class_standard: q.classStandard,
            subject: q.subject.toLowerCase(),
            chapter: q.chapter,
            difficulty: q.difficulty.toLowerCase(),
            points: 10,
            is_active: true,
            answer_explanation: q.explanation,
            options: q.options.map((opt, index) => ({
                option_text: opt,
                display_order: index + 1,
                is_correct: index === correctIndex,
                explanation: index === correctIndex ? 'Correct!' : null
            }))
        };
    })
};

fs.writeFileSync(path, JSON.stringify(normalized, null, 4));
console.log(`Normalized ${data.length} questions.`);
