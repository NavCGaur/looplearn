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

let deduplicated = [];
let seen = new Set();
questionsArray.forEach(q => {
    let qText = q.question || q.question_text;
    if (!seen.has(qText)) {
        seen.add(qText);
        deduplicated.push(q);
    }
});

function getWords(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
}

function calcOverlap(opt, expl) {
    let optWords = getWords(opt);
    let explWords = getWords(expl);
    let match = 0;
    optWords.forEach(w => {
        if (explWords.includes(w)) match++;
    });
    return match / (optWords.length || 1);
}

// Fixed correct options mapping for accuracy
const hardcodedFixes = {
    "Pressure is defined as the force acting per unit ________ of a surface.": "Area",
    "Why do school bags often have wide straps instead of thin strings?": "To decrease the pressure on shoulders",
    "Which of the following statements about air pressure is correct?": "Air exerts pressure in all directions",
    "What happens to the pressure of air when its speed increases?": "Pressure decreases",
    "High-speed winds blowing over the roof of a hut can lift the roof because:": "High speed creates low pressure on top",
    "Air moves from a region of __________ pressure to a region of __________ pressure.": "High, Low",
    "On heating, air __________ and becomes __________.": "Expands, Lighter",
    "Which instrument is used to measure wind speed?": "Anemometer",
    "A balloon expands when we blow air into it because:": "Air inside exerts pressure on the walls",
    "What is the primary cause of wind circulation on Earth?": "Uneven heating of the Earth by the Sun",
    "During the day in coastal areas, wind usually blows from:": "Sea to Land",
    "Which of the following is a characteristic of a thunderstorm?": "Heavy rain, lightning, and thunder",
    "The center of a cyclone is a calm area called the:": "Eye",
    "Cyclones are known as __________ in the American continent.": "Hurricanes",
    "A dark funnel-shaped cloud that reaches from the sky to the ground is a:": "Tornado",
    "Why are holes made in banners and hoardings hanging in the open?": "To reduce the air pressure exerted by the wind",
    "If you blow air between two hanging balloons, they will:": "Move towards each other",
    "Thunder is caused by:": "The rapid expansion of air heated by lightning",
    "During a thunderstorm, it is safest to take shelter in:": "Inside a car or a building",
    "The 'Standard Unit' (SI) of pressure is:": "Pascal",
    "What is the direction of wind during the 'Winter Monsoon' in India?": "Land to Sea",
    "If a force of 100 N is applied to an area of 2 m², the pressure is:": "50 Pa",
    "What provides the energy for the formation of a cyclone?": "Heat released when water vapor condenses into rain",
    "Which coast of India is more vulnerable to cyclones?": "East Coast",
    "A person standing in the 'Eye' of a cyclone would experience:": "Calm weather and clear sky",
    "Which of the following is the fundamental idea of the particulate nature of matter?": "Matter is made up of tiny, discrete particles",
    "In which state of matter are the particles packed most closely together in a fixed, regular pattern?": "Solid",
    "What happens to the movement of particles when the temperature of a substance increases?": "Particles move faster",
    "The smell of hot sizzling food reaches you several metres away, but to get the smell from cold food you have to go close. This is due to:": "Diffusion",
    "Which state of matter is highly compressible?": "Gas",
    "When a crystal of potassium permanganate is placed in water, the purple colour spreads throughout. This proves that:": "Particles of matter are constantly moving",
    "The force of attraction between particles is weakest in:": "Oxygen",
    "Which of the following describes the 'Liquid' state?": "No fixed shape but fixed volume",
    "What occupies the 'empty space' between particles in a gas?": "Nothing (Vacuum)",
    "Brownian motion describes:": "The zig-zag random motion of particles",
    "If you compress a gas in a syringe, what decreases?": "The space between particles",
    "A balloon expands when you blow air into it because:": "Air particles take up space and collide with the walls",
    "Which of the following cannot flow?": "Wood",
    "Two atoms of Hydrogen combine to form a stable particle called a:": "Molecule",
    "The interparticle distance is maximum in:": "Water Vapor",
    "What happens when you dissolve sugar in water regarding the volume?": "Volume stays almost the same",
    "Particles in a __________ only vibrate about their fixed positions.": "Solid",
    "Which of the following is NOT an example of matter?": "Feeling of cold",
    "When we pour a liquid from a flask into a bowl, it changes its:": "Shape",
    "The density of matter is generally highest in which state?": "Solid",
    "A diver is able to cut through water in a swimming pool. Which property of matter does this observation show?": "There are spaces between particles of water",
    "Diffusion occurs fastest in gases because:": "Gas particles move rapidly in all directions",
    "Which of the following can be termed 'fluids'?": "Liquids and Gases",
    "If you put a drop of ink in a glass of water, it spreads without stirring. This process is:": "Diffusion",
    "In the 'Activity with the Syringe', why was it impossible to push the piston when it was filled with sand?": "Sand particles are already very close (solids are incompressible)",
    "Which of the following is the simplest form of matter that cannot be broken down into simpler substances by chemical means?": "Element",
    "When two or more elements combine chemically in a fixed ratio, they form a:": "Compound",
    "Which of these is a characteristic of a mixture but NOT a compound?": "Components can be separated by physical methods",
    "The chemical formula for Common Salt is:": "NaCl",
    "Which of the following is an example of a homogeneous mixture?": "Saltwater solution",
    "The symbol for the element Gold is:": "Au",
    "Water (H2O) is classified as a compound because:": "Hydrogen and Oxygen are chemically bonded in a 2:1 ratio",
    "Which of the following mixtures can be separated using a magnet?": "Iron filings and Sand",
    "Air is considered a mixture because:": "Its composition of gases can vary slightly",
    "When iron and sulfur are heated together to form iron sulfide, the product:": "Has entirely different properties from iron and sulfur",
    "The horizontal rows in a Periodic Table are called:": "Periods",
    "Which of these is a noble gas?": "Helium",
    "A mixture of oil and water is an example of a:": "Heterogeneous mixture",
    "What is the smallest unit of a compound that maintains its chemical properties?": "Molecule",
    "Brass is an alloy of Copper and Zinc. Brass is a:": "Solid solution (Mixture)",
    "Which of the following is NOT matter?": "Light",
    "The elements in a compound are combined in a:": "Fixed ratio by mass",
    "If you stir sand into water, you create a:": "Suspension",
    "Which gas is used in advertising signs for its bright glow when electricity passes through it?": "Neon",
    "Pure gold is 24 carats. 22 carat gold is a:": "Mixture",
    "Which scientist is famously associated with the development of the Periodic Table?": "Dmitri Mendeleev",
    "Which of these is a diatomic element (exists naturally as a molecule of two atoms)?": "Oxygen",
    "Distilled water is a/an:": "Compound",
    "The process of separating a solid from a liquid by pouring it through a porous material is called:": "Filtration",
    "What happens when sugar dissolves in water?": "A mixture is formed",
    "Which of the following is an example of a uniform (homogeneous) mixture?": "Salt in water",
    "In a solution of sugar and water, sugar is the __________ and water is the __________": "Solute, Solvent",
    "Water is often called a 'Universal Solvent' because:": "It can dissolve a large variety of substances",
    "A solution in which no more solute can be dissolved at a given temperature is called a/an:": "Saturated solution",
    "What happens to the solubility of sugar in water if the temperature of the water is increased?": "It increases",
    "Which of the following describes a 'dilute' solution?": "A solution with very little solute",
    "Which process is used to recover salt from sea water?": "Evaporation",
    "Why do aquatic animals like fish survive in ponds and rivers?": "Oxygen from the air dissolves in the water",
    "What is the result of mixing two or more substances that do not chemically react?": "A mixture",
    "Carbonated drinks (soda) are examples of:": "Gas in liquid solution",
    "Which factor does NOT affect how fast a solid solute dissolves in a liquid?": "The shape of the container",
    "If you have a saturated solution of salt, how can you make it unsaturated without adding more water?": "By heating it",
    "Soft drinks fizz when opened because:": "The pressure decreases, reducing gas solubility",
    "What is 'solubility'?": "The maximum amount of solute that can dissolve in a specific amount of solvent at a certain temperature",
    "Which of these is a solution of a gas in a gas?": "Air",
    "Small round cakes of salt in Ningel village are wrapped in:": "Banana leaves",
    "When sugar is dissolved in water, the volume of the water does not increase significantly because:": "Sugar particles fit into the empty spaces between water molecules",
    "Which of the following will form a non-uniform (heterogeneous) mixture with water?": "Oil",
    "How can you separate a mixture of sand and salt?": "Dissolve in water, filter the sand, then evaporate the water",
    "The components of an Oral Rehydration Solution (ORS) are:": "Sugar, salt, and water",
    "Why is it easier to dissolve sugar in hot milk than in cold milk?": "High temperature increases the rate of dissolving",
    "Which of the following is NOT a property of a true solution?": "The solute particles can be seen with a naked eye",
    "Tincture of iodine is a solution used as an antiseptic. What is the solvent in it?": "Alcohol",
    "What happens when you add more and more solute to a fixed amount of solvent?": "The solution becomes more concentrated",
    "A solution of two or more metals, or a metal and a non-metal, is called a/an:": "Alloy"
};

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
        let bestText = null;

        let hardcoded = hardcodedFixes[normalized.question_text.trim()];
        if (hardcoded) {
            bestText = hardcoded;
        } else {
            let explLow = normalized.answer_explanation.toLowerCase();
            let scores = q.options.map(opt => {
                const text = typeof opt === 'string' ? opt : opt.option_text;
                return {
                    text: text,
                    score: calcOverlap(text, explLow),
                    inExpl: explLow.includes(text.toLowerCase())
                };
            });

            let sorted = [...scores].sort((a, b) => {
                if (a.inExpl && !b.inExpl) return -1;
                if (!a.inExpl && b.inExpl) return 1;
                if (b.score !== a.score) return b.score - a.score;
                return b.text.length - a.text.length;
            });
            bestText = sorted[0].text;
        }

        normalized.options = q.options.map((opt, optIdx) => {
            const text = typeof opt === 'string' ? opt : opt.option_text;
            let isCorrect = (text === bestText);

            return {
                option_text: text,
                display_order: optIdx + 1,
                is_correct: isCorrect,
                explanation: ""
            };
        });
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
