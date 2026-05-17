const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
let rawContent = fs.readFileSync(jsonPath, 'utf8');

// Fix multiple pasted arrays
rawContent = rawContent.replace(/\]\s*\[/g, ',');

let questionsArray;
try {
    questionsArray = JSON.parse(rawContent);
} catch (e) {
    console.error("Failed to parse JSON:", e.message);
    // Wrap it in array brackets if needed
    try {
        questionsArray = JSON.parse(`[${rawContent}]`);
    } catch (e2) {
        console.error("Failed to parse even with bracket wrapping.", e2.message);
        process.exit(1);
    }
}

let normalizedQuestions = [];
let manualAuditList = [];

questionsArray.forEach((q, i) => {
    let normalized = {
        question_text: q.question || q.question_text || '',
        question_type: q.type || q.question_type || 'mcq',
        class_standard: q.classStandard || q.class_standard || 8,
        subject: (q.subject || 'science').toLowerCase(),
        chapter: q['chapter name'] || q.chapter || '',
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        points: q.points || 10,
        is_active: q.is_active !== undefined ? q.is_active : true,
        answer_explanation: q.explanation || q.answer_explanation || ''
    };

    if (q.options && Array.isArray(q.options)) {
        normalized.options = q.options.map((opt, optIdx) => {
            const text = typeof opt === 'string' ? opt : opt.option_text;
            let isCorrect = false;

            // Heuristic for finding correct answer
            const expl = normalized.answer_explanation.toLowerCase();
            const optTxt = text.toLowerCase();

            // Simple match
            if (expl.includes(optTxt)) {
                isCorrect = true;
            }

            return {
                option_text: text,
                display_order: optIdx + 1,
                is_correct: isCorrect,
                explanation: ""
            };
        });

        const correctCount = normalized.options.filter(o => o.is_correct).length;
        if (correctCount !== 1) {
            manualAuditList.push({
                index: i + 1,
                question: normalized.question_text,
                options: normalized.options.map(o => o.option_text),
                explanation: normalized.answer_explanation,
                correctCount: correctCount
            });
        }
    }

    normalizedQuestions.push(normalized);
});

fs.writeFileSync(jsonPath, JSON.stringify({ questions: normalizedQuestions }, null, 4));
console.log(`Saved normalized JSON with ${normalizedQuestions.length} questions.`);

if (manualAuditList.length > 0) {
    console.log(`\nFound ${manualAuditList.length} questions needing manual answer verification:`);
    manualAuditList.forEach(item => {
        console.log(`\n--- [Q${item.index}] (${item.correctCount} correct answers determined) ---`);
        console.log(`Q: ${item.question}`);
        console.log(`Exp: ${item.explanation}`);
        console.log(`Opts: ${item.options.join(' | ')}`);
    });
} else {
    console.log("\nAll questions have exactly 1 correct answer assigned!");
}
