import { requestWithRetries } from '../utility/geminiQuizApi.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Basic MCQ schema
const mcqItemSchema = {
  type: 'object',
  required: ['questionText', 'options', 'correctAnswer'],
  properties: {
    questionText: { type: 'string' },
    options: { type: 'array', minItems: 2, items: { type: 'string' } },
    correctAnswer: { type: 'string' }
  }
};

const mcqResponseSchema = {
  type: 'object',
  required: ['questions'],
  properties: {
    questions: { type: 'array', items: mcqItemSchema }
  }
};

const validateMcq = ajv.compile(mcqResponseSchema);

// Build prompt tailored for MCQ generation
function buildMcqPrompt({ classStandard, subject, chapter, topic, numberOfQuestions }) {
  return `You are an expert educator specializing in creating educational content for Indian schools.\n
Generate exactly ${numberOfQuestions} multiple-choice questions (MCQ) for ${subject} at ${classStandard} level, focused on the chapter: "${chapter}"${topic ? ' and topic: "' + topic + '"' : ''}.\n
Requirements:\n1) Return ONLY valid JSON in this exact shape:\n{\n  "questions": [\n    {\n      "questionText": "... (use \\\"____\\\" to indicate blanks if needed)",\n      "options": ["opt1","opt2","opt3","opt4"],\n      "correctAnswer": "opt2"\n    }\n  ]\n}\n2) Use LaTeX for any math/chemical formulas, wrapped in dollar signs, e.g., $\\pi r^2$, $\\text{H}_2\\text{SO}_4$.\n3) Keep options concise (one-line).\n4) Avoid additional commentary or text outside the JSON.\n5) Ensure distractors are plausible.\n
Provide the JSON only.`;
}

async function callGeminiPrompt(prompt, temperature = 0.2, maxTokens = 1200) {
  try {
    const resp = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens: maxTokens } });
    const text = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text;
  } catch (err) {
    console.error('Gemini call failed in generator service:', err?.message || err);
    throw err;
  }
}

export const generateUnifiedQuestions = async (params) => {
  const { subject, classStandard, chapter, topic = '', numberOfQuestions = 5, questionType } = params;
  try {
    if (questionType !== 'mcq') {
      throw new Error('Only mcq generation is supported in this version');
    }

    const prompt = buildMcqPrompt({ classStandard, subject, chapter, topic, numberOfQuestions });
    console.log('Sending prompt to Gemini (mcq): length=', prompt.length);

  const raw = await callGeminiPrompt(prompt, 0.25, 2000);
    console.log('Raw Gemini response length:', raw?.length || 0);

    if (!raw) throw new Error('Empty response from Gemini');

    // Try extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // provide helpful error info
      return { success: false, error: 'No JSON object found in model response', rawResponse: raw };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return { success: false, error: 'Failed to parse JSON from model response', parseError: parseErr.message, rawResponse: raw };
    }

    const valid = validateMcq(parsed);
    if (!valid) {
      return { success: false, error: 'Validation failed for MCQ schema', validationErrors: validateMcq.errors, parsed, rawResponse: raw };
    }

  // Attach metadata for preview; do not save to DB here
    // Map model output into the DB schema shape to avoid validation errors
    const augmented = parsed.questions.map((q, idx) => ({
      // copy text and options
      questionText: q.questionText,
      options: q.options || [],
      // schema expects `answer` string; models/validators may accept correctOptionIndex
      answer: q.correctAnswer || (Array.isArray(q.options) ? q.options[q.correctOptionIndex] : undefined) || '',
      // fill metadata fields expected by DB
      subject,
      classStandard,
      chapter,
      topic: topic || chapter || 'General',
      // use the enum value expected by Mongoose
      questionType: 'multiple-choice',
      difficulty: q.difficulty || 'medium',
      metadata: { generatedAt: new Date(), questionIndex: idx + 1 }
    }));

  // Simple cost estimate: assume ~250 tokens per MCQ (prompt+response) unless env overrides
  const tokensPerQuestion = Number(process.env.ESTIMATED_TOKENS_PER_QUESTION) || 250;
  const tokenCount = tokensPerQuestion * numberOfQuestions;
  // cost per 1k tokens (in USD) can be set in env as COST_PER_1K_TOKENS (default conservative 0.003)
  const costPer1k = Number(process.env.COST_PER_1K_TOKENS) || 0.003;
  const estimatedCostUsd = (tokenCount / 1000) * costPer1k;

  return { success: true, questions: augmented, rawResponse: raw, costEstimate: { tokenCount, estimatedCostUsd } };
  } catch (err) {
    console.error('generateUnifiedQuestions error:', err);
    return { success: false, error: err.message };
  }
};

export default { generateUnifiedQuestions };
