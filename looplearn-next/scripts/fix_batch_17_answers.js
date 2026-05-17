const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = data.questions;

// Map of 1-indexed question number to the index of the correct option (0-indexed)
const fixes = {
    4: 1,  // The atmosphere would escape into space
    10: 1, // Asexual reproduction (fix multiple match issue)
    12: 2, // Reproduction using plant parts like leaf or stem
    13: 2, // Asexual division
    17: 1, // Climate change, Biodiversity loss, Pollution
    18: 2, // It releases extra carbon dioxide that traps heat
    20: 1, // The vast amount of water
    22: 1, // The Magnetic Field
    24: 2, // Pollen to another flower
    25: 1  // It includes all living beings and their living places
};

Object.entries(fixes).forEach(([qNum, correctOptIdx]) => {
    const q = questions[parseInt(qNum) - 1];
    q.options.forEach((opt, idx) => {
        opt.is_correct = (idx === correctOptIdx);
    });
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4));
console.log(`Applied manual fixes to ${Object.keys(fixes).length} questions.`);
