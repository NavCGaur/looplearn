require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchQuestions(classStd) {
    const { data: questions, error } = await supabase
        .from('questions')
        .select(`
            id,
            question_text,
            question_type,
            chapter,
            question_options (
                option_text,
                is_correct,
                explanation,
                display_order
            ),
            fillblank_answers (
                accepted_answer
            )
        `)
        .eq('class_standard', classStd)
        .eq('subject', 'science')
        .eq('is_active', true)
        .order('chapter');

    if (error) {
        console.error(`Error fetching class ${classStd}:`, error);
        return [];
    }
    return questions || [];
}

function formatChapter(chapterName, questions) {
    let md = `\n\n# ${chapterName}\n\n`;
    
    // Part 1: Questions
    md += `## Questions\n\n`;
    questions.forEach((q, idx) => {
        md += `**Q${idx + 1}. ${q.question_text}**\n\n`;
        
        if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
            const options = [...(q.question_options || [])].sort((a,b) => a.display_order - b.display_order);
            const letters = ['A', 'B', 'C', 'D', 'E'];
            options.forEach((opt, i) => {
                md += `   ${letters[i]}) ${opt.option_text}\n`;
            });
            md += `\n`;
        } else if (q.question_type === 'fillblank') {
            md += `\n`;
        }
    });

    // Part 2: Answers
    md += `\n---\n\n## Answers\n\n`;
    questions.forEach((q, idx) => {
        if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
            const options = [...(q.question_options || [])].sort((a,b) => a.display_order - b.display_order);
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const correctOptIdx = options.findIndex(o => o.is_correct);
            const correctLetter = correctOptIdx >= 0 ? letters[correctOptIdx] : '?';
            const correctOpt = options[correctOptIdx];
            
            md += `**${idx + 1}.** ${correctLetter}) ${correctOpt ? correctOpt.option_text : 'Unknown'}\n`;
            if (correctOpt && correctOpt.explanation) {
                md += `   *Explanation: ${correctOpt.explanation}*\n\n`;
            } else {
                md += `\n`;
            }
        } else if (q.question_type === 'fillblank') {
            const ans = q.fillblank_answers && q.fillblank_answers.length > 0 
                ? q.fillblank_answers.map(a => a.accepted_answer).join(' OR ')
                : 'Unknown';
            md += `**${idx + 1}.** ${ans}\n\n`;
        }
    });

    return md;
}

async function exportDocs() {
    for (const classStd of [8, 9]) {
        console.log(`Fetching Class ${classStd} questions...`);
        const questions = await fetchQuestions(classStd);
        
        if (questions.length === 0) {
            console.log(`No active science questions found for Class ${classStd}.`);
            continue;
        }

        // Group by chapter
        const byChapter = {};
        questions.forEach(q => {
            const chap = q.chapter || 'Uncategorized';
            if (!byChapter[chap]) byChapter[chap] = [];
            byChapter[chap].push(q);
        });

        let documentText = `# Class ${classStd} Science Questions & Answers\n\n`;
        documentText += `*Total Questions: ${questions.length}*\n\n`;
        
        // Table of contents
        documentText += `## Chapters\n`;
        Object.keys(byChapter).sort().forEach(chap => {
            documentText += `- ${chap} (${byChapter[chap].length} questions)\n`;
        });
        
        documentText += `\n<br>\n`;

        // Generate chapters
        Object.keys(byChapter).sort().forEach(chap => {
            documentText += formatChapter(chap, byChapter[chap]);
        });

        const safeFilename = `Class_${classStd}_Science_Questions.md`;
        const filepath = path.join(__dirname, safeFilename);
        fs.writeFileSync(filepath, documentText);
        console.log(`✅ Saved ${questions.length} questions to ${filepath}`);
    }
}

exportDocs().catch(console.error);
