/**
 * Generates SQL INSERT statements from SCIENCE_QUESTIONS.json
 * for manual insertion into Supabase SQL editor.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const TEACHER_UUID = process.env.TEACHER_UUID || 'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3';

const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = data.questions;

// Escape single quotes for SQL
function esc(str) {
    if (str === null || str === undefined) return 'NULL';
    return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- Science Questions Batch 17 - Insertion SQL\n`;
sql += `-- Chapter: Our Home: Earth, a Unique Life Sustaining Planet (Class 8)\n`;
sql += `-- Generated: ${new Date().toISOString()}\n`;
sql += `-- Run this in your Supabase SQL Editor\n\n`;

questions.forEach((q, i) => {
    const questionVar = `q_id_${i + 1}`;
    sql += `-- Question ${i + 1}: ${q.question_text.substring(0, 50)}...\n`;
    sql += `DO $$\n`;
    sql += `DECLARE\n  ${questionVar} UUID;\nBEGIN\n`;

    sql += `  INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points, is_active, answer_explanation, created_by)\n`;
    sql += `  VALUES (\n`;
    sql += `    ${esc(q.question_text)},\n`;
    sql += `    ${esc(q.question_type)},\n`;
    sql += `    ${q.class_standard},\n`;
    sql += `    ${esc(q.subject)},\n`;
    sql += `    ${esc(q.chapter)},\n`;
    sql += `    ${esc(q.difficulty)},\n`;
    sql += `    ${q.points},\n`;
    sql += `    ${q.is_active},\n`;
    sql += `    ${esc(q.answer_explanation)},\n`;
    sql += `    '${TEACHER_UUID}'::uuid\n`;
    sql += `  ) RETURNING id INTO ${questionVar};\n\n`;

    if (q.options && q.options.length > 0) {
        sql += `  INSERT INTO question_options (question_id, option_text, display_order, is_correct, explanation)\n  VALUES\n`;
        const optLines = q.options.map(opt =>
            `    (${questionVar}, ${esc(opt.option_text)}, ${opt.display_order}, ${opt.is_correct}, ${esc(opt.explanation || '')})`
        );
        sql += optLines.join(',\n') + ';\n';
    }

    sql += `END $$;\n\n`;
});

const outputPath = path.join(__dirname, '../docs/batch_17_insert.sql');
fs.writeFileSync(outputPath, sql);
console.log(`SQL generated: docs/batch_17_insert.sql`);
console.log(`Total questions: ${questions.length}`);
