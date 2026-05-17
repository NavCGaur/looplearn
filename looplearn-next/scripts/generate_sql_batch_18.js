const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
let rawContent = fs.readFileSync(jsonPath, 'utf8');

let questionsArray;
try {
    questionsArray = JSON.parse(rawContent);
} catch (e) {
    questionsArray = JSON.parse(`[${rawContent.replace(/\]\s*\[/g, ',')}]`);
}
if (!Array.isArray(questionsArray) && questionsArray.questions) {
    questionsArray = questionsArray.questions;
}

const knownCorrect = [
    "Area", "To decrease the pressure on shoulders", "Air exerts pressure in all directions", "Pressure decreases", "High speed creates low pressure on top", "High, Low", "Expands, Lighter", "Anemometer", "Air inside exerts pressure on the walls", "Uneven heating of the Earth by the Sun", "Sea to Land", "Heavy rain, lightning, and thunder", "Eye", "Hurricanes", "Tornado", "To reduce the air pressure exerted by the wind", "Move towards each other", "The rapid expansion of air heated by lightning", "Inside a car or a building", "Pascal", "Land to Sea", "50 Pa", "Heat released when water vapor condenses into rain", "East Coast", "Calm weather and clear sky",
    "Matter is made up of tiny, discrete particles", "Solid", "Particles move faster", "Diffusion", "Gas", "Particles of matter are constantly moving", "Oxygen", "No fixed shape but fixed volume", "Nothing (Vacuum)", "The zig-zag random motion of particles", "The space between particles", "Air particles take up space and collide with the walls", "Wood", "Molecule", "Water Vapor", "Volume stays almost the same", "Feeling of cold", "Shape", "There are spaces between particles of water", "Gas particles move rapidly in all directions", "Liquids and Gases", "Sand particles are already very close (solids are incompressible)",
    "Element", "Compound", "Components can be separated by physical methods", "NaCl", "Saltwater solution", "Au", "Hydrogen and Oxygen are chemically bonded in a 2:1 ratio", "Iron filings and Sand", "Its composition of gases can vary slightly", "Has entirely different properties from iron and sulfur", "Periods", "Helium", "Heterogeneous mixture", "Solid solution (Mixture)", "Light", "Fixed ratio by mass", "Suspension", "Neon", "Mixture", "Dmitri Mendeleev", "Filtration", "A mixture is formed",
    "Salt in water", "Solute, Solvent", "It can dissolve a large variety of substances", "Saturated solution", "It increases", "A solution with very little solute", "Evaporation", "Oxygen from the air dissolves in the water", "A mixture", "Gas in liquid solution", "The shape of the container", "By heating it", "The pressure decreases, reducing gas solubility", "The maximum amount of solute that can dissolve in a specific amount of solvent at a certain temperature", "Air", "Banana leaves", "Sugar particles fit into the empty spaces between water molecules", "Oil", "Dissolve in water, filter the sand, then evaporate the water", "Sugar, salt, and water", "High temperature increases the rate of dissolving", "The solute particles can be seen with a naked eye", "Alcohol", "The solution becomes more concentrated", "Alloy"
];

// Add manual matching function for a few edge cases
const isCorrectMatch = (question, optText) => {
    if (knownCorrect.includes(optText)) return true;

    // Heuristic fallback
    if (question.explanation && question.explanation.toLowerCase().includes(optText.toLowerCase()) && optText.length > 3) return true;

    return false;
};

let deduplicated = [];
let seen = new Set();
questionsArray.forEach(q => {
    let qText = q.question || q.question_text;
    if (!seen.has(qText)) {
        seen.add(qText);
        deduplicated.push(q);
    }
});

let normalizedQuestions = deduplicated.map((q, i) => {
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
        let hasCorrect = false;
        normalized.options = q.options.map((opt, optIdx) => {
            const text = typeof opt === 'string' ? opt : opt.option_text;
            let isCorrect = isCorrectMatch(q, text);
            return {
                option_text: text,
                display_order: optIdx + 1,
                is_correct: isCorrect,
                explanation: ""
            };
        });

        // Ensure exactly 1 correct
        const correctOptions = normalized.options.filter(o => o.is_correct);
        if (correctOptions.length !== 1) {
            console.log(`[!] Warning: Q"${normalized.question_text}" has ${correctOptions.length} correct options. Options: ${normalized.options.map(o => o.option_text).join(' | ')}`);
        }
    }
    return normalized;
});

const sqlPath = path.join(__dirname, '../docs/batch_18_insert.sql');
let sqlContent = `-- Science Questions Batch 18 - Insertion SQL\n`;
sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
sqlContent += `-- Run this in your Supabase SQL Editor\n\n`;

normalizedQuestions.forEach((q, i) => {
    let safeQuestion = q.question_text.replace(/'/g, "''");
    let safeExpl = q.answer_explanation.replace(/'/g, "''");
    let safeChapter = q.chapter.replace(/'/g, "''");
    let safeSubject = q.subject.replace(/'/g, "''");
    let safeDiff = q.difficulty.replace(/'/g, "''");

    // Default teacher UUID for the project
    const teacherId = 'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3';
    let shortTitle = q.question_text.substring(0, 50).replace(/\n/g, ' ') + '...';

    sqlContent += `-- Question ${i + 1}: ${shortTitle}\n`;
    sqlContent += `DO $$\nDECLARE\n  q_id_${i + 1} UUID;\nBEGIN\n`;

    sqlContent += `  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)\n`;
    sqlContent += `  VALUES (\n`;
    sqlContent += `    '${safeQuestion}',\n`;
    sqlContent += `    '${q.question_type}',\n`;
    sqlContent += `    ${q.class_standard},\n`;
    sqlContent += `    '${safeSubject}',\n`;
    sqlContent += `    '${safeChapter}',\n`;
    sqlContent += `    '${safeDiff}',\n`;
    sqlContent += `    ${q.points},\n`;
    sqlContent += `    ${q.is_active},\n`;
    sqlContent += `    '${safeExpl}',\n`;
    sqlContent += `    '${teacherId}'::uuid\n`;
    sqlContent += `  ) RETURNING id INTO q_id_${i + 1};\n\n`;

    sqlContent += `  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)\n  VALUES\n`;

    let optRows = q.options.map(opt => {
        let safeOpt = opt.option_text.replace(/'/g, "''");
        let safeOptExpl = (opt.explanation || '').replace(/'/g, "''");
        return `    (q_id_${i + 1}, '${safeOpt}', ${opt.display_order}, ${opt.is_correct}, '${safeOptExpl}')`;
    });

    sqlContent += optRows.join(',\n') + `;\nEND $$;\n\n`;
});

fs.writeFileSync(sqlPath, sqlContent);
fs.writeFileSync(jsonPath, JSON.stringify({ questions: normalizedQuestions }, null, 4));

console.log(`Successfully generated batch_18_insert.sql with ${normalizedQuestions.length} unique questions.`);
