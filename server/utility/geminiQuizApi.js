import axios from "axios";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store your key in .env

// Simple in-process rate limiter + retry wrapper
let lastRequestAt = 0;
const MIN_DELAY_MS = parseInt(process.env.GEMINI_MIN_DELAY_MS || '400', 10); // default 400ms between requests

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const requestWithRetries = async (payload, maxRetries = 4) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    const now = Date.now();
    const since = now - lastRequestAt;
    if (since < MIN_DELAY_MS) {
      await sleep(MIN_DELAY_MS - since);
    }

    try {
      lastRequestAt = Date.now();
      const resp = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return resp;
    } catch (err) {
      attempt++;
      const status = err?.response?.status;
      const retryAfter = err?.response?.headers?.['retry-after'];

      // If 429, respect Retry-After if present, else exponential backoff
      if (status === 429) {
        const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : (Math.pow(2, attempt) * 1000);
        console.warn(`Gemini 429 received. attempt=${attempt}, waiting ${wait}ms before retry.`);
        await sleep(wait);
        continue; // retry
      }

      // For network errors or other 5xx, attempt retry with backoff
      if (!status || (status >= 500 && status < 600)) {
        const wait = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error from Gemini. attempt=${attempt}, status=${status}, waiting ${wait}ms before retry.`);
        await sleep(wait);
        continue;
      }

      // Non-retriable error
      throw err;
    }
  }
  throw new Error('Exceeded retries for Gemini request');
};

export const getGeminiQuiz = async (wordObj) => {
  const { word, definition } = wordObj;

  const prompt = `
Generate two types of quiz questions for vocabulary learning based on the following word and its definition:

Word: "${word}"
Definition: "${definition}"

1. An MCQ (multiple-choice question) where the question asks for the meaning of the word. Include 4 options (one correct and three distractors). Mark the correct answer.

2. A fill-in-the-blank sentence using the word in a natural context. Provide the correct answer separately.

Format the response strictly as JSON with this structure:
{
  "mcq": {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": "..."
  },
  "fillInTheBlank": {
    "question": "...",
    "answer": "..."
  }
}
`;

  try {
  const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }] });
  const textResponse = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Parse JSON part from the text
    const match = textResponse.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const quizData = JSON.parse(match[0]);
    return quizData;

  } catch (error) {
    console.error("Gemini API error:", error.message);
    return null;
  }
};

// Combined call: return definition, partOfSpeech, exampleSentence, translations and quiz in one structured response
export const getGeminiWordData = async (word) => {
  const prompt = `
You are a language tutor for Indian school students. For the given word, provide the following in exact JSON format.

Word: "${word}"

Return JSON with keys:
    mcq: { question, options: [..4 options..], correctAnswer },
    fillInTheBlank: { question, answer }
  }

Ensure the response is valid JSON ONLY (no additional commentary). Example structure:
{
  "partOfSpeech": "noun",
  "definition": "...",
  "exampleSentence": "...",
  "translations": { "wordHindi": "...", "definitionHindi": "...", "exampleSentenceHindi": "..." },
  "quiz": { "mcq": { "question": "..", "options": ["..","..","..",".."], "correctAnswer": ".." }, "fillInTheBlank": { "question": "..", "answer": ".." } }
}
`;

  try {
  const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }] });

  const textResponse = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return null;

    const match = textResponse.match(/\{[\s\S]*\}/);
    if (!match) return null;

      const parsed = JSON.parse(match[0]);
      // Normalize shape
      return {
        partOfSpeech: parsed.partOfSpeech || parsed.part_of_speech || '',
        definition: parsed.definition || '',
        exampleSentence: parsed.exampleSentence || parsed.example_sentence || '',
        translations: parsed.translations || parsed.translation || { wordHindi: '', definitionHindi: '', exampleSentenceHindi: '' },
        quiz: parsed.quiz || null
      };
  } catch (err) {
    console.error('getGeminiWordData error:', err?.message || err);
    return null;
  }
};

// Batch helper: accept array of words and return structured data for each
export const getGeminiWordsData = async (words = []) => {
  if (!Array.isArray(words) || words.length === 0) return [];

  // Build prompt asking for an array of JSON objects
  const wordList = words.map(w => w.trim()).filter(Boolean);
  const prompt = `
You are a language tutor for Indian school students. For the following words, return an array of JSON objects with keys: word, partOfSpeech, definition, exampleSentence, translations (wordHindi, definitionHindi, exampleSentenceHindi), and quiz (mcq + fillInTheBlank).

Words: ${JSON.stringify(wordList)}

Return ONLY valid JSON. Example structure:
[
  {
    "word": "...",
    "partOfSpeech": "noun",
    "definition": "...",
    "exampleSentence": "...",
    "translations": { "wordHindi": "...", "definitionHindi": "...", "exampleSentenceHindi": "..." },
    "quiz": { "mcq": { "question": "..", "options": [".."], "correctAnswer": ".." }, "fillInTheBlank": { "question": "..", "answer": ".." } }
  }
]
`;

  try {
    const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }] });
    const textResponse = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return [];

    // Extract JSON array
    const match = textResponse.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    // Normalize entries
    return parsed.map(p => ({
      word: p.word || '',
      partOfSpeech: p.partOfSpeech || p.part_of_speech || '',
      definition: p.definition || '',
      exampleSentence: p.exampleSentence || p.example_sentence || '',
      translations: p.translations || p.translation || { wordHindi: '', definitionHindi: '', exampleSentenceHindi: '' },
      quiz: p.quiz || null
    }));
  } catch (err) {
    console.error('getGeminiWordsData error:', err?.message || err);
    return [];
  }
};

// Simple instrumentation to count requests
let geminiRequestCount = 0;
let geminiWindowStart = Date.now();
const GEMINI_WINDOW_MS = 60 * 1000; // 1 minute

const incRequestCount = () => {
  const now = Date.now();
  if (now - geminiWindowStart > GEMINI_WINDOW_MS) {
    geminiWindowStart = now;
    geminiRequestCount = 0;
  }
  geminiRequestCount++;
};

// Wrap requestWithRetries to increment counter
const originalRequest = requestWithRetries;
// Serialize requests to avoid concurrent outbound calls and add small jitter to spacing
let lastPromise = Promise.resolve();
const wrappedRequestWithCount = (payload, maxRetries = 4) => {
  incRequestCount();

  const task = async () => {
    // small random jitter to avoid thundering herd
    const jitter = Math.floor(Math.random() * Math.min(1000, MIN_DELAY_MS));
    const now = Date.now();
    const since = now - lastRequestAt;
    if (since < MIN_DELAY_MS + jitter) {
      await sleep(MIN_DELAY_MS + jitter - since);
    }
    try {
      const resp = await originalRequest(payload, maxRetries);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  // Chain onto lastPromise to ensure serialization
  lastPromise = lastPromise.then(() => task()).catch(err => {
    // swallow to keep chain alive; rethrow for caller
    console.warn('Gemini queued task failed:', err?.message || err);
    throw err;
  });

  return lastPromise;
};

// Export the wrapped requester (avoid duplicate export names)
export { wrappedRequestWithCount as requestWithRetries };

export const getGeminiStats = () => ({
  requestsInWindow: geminiRequestCount,
  windowMs: GEMINI_WINDOW_MS,
  windowStart: geminiWindowStart
});
