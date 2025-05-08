import axios from "axios";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store your key in .env

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
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;

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
