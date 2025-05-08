import Word from "../models/wordSchema.js";
import Quiz from "../models/quizSchema.js";
import { getGeminiQuiz } from "./geminiQuizApi.js"; // You’ll implement this next

export const generateAndPopulateQuizzes = async () => {
  try {
    const words = await Word.find({
        $or: [{ quiz: false }, { quiz: { $exists: false } }],
      });
      
    for (const word of words) {
        console.log(`Generating quiz for word: ${word.word}`);
      const geminiResponse = await getGeminiQuiz(word);

      if (!geminiResponse) continue;

      const quizDoc = new Quiz({
        wordId: word._id,
        word: word.word,
        mcq: geminiResponse.mcq,
        fillInTheBlank: geminiResponse.fillInTheBlank,
      });

      await quizDoc.save();
      word.quiz = true;
      await word.save();
        console.log(`Quiz saved for word: ${word.word}`);
    }

    console.log("Quiz generation completed.");
  } catch (error) {
    console.error("Error generating quizzes:", error.message);
  }
};
