import Word from "../models/wordSchema.js";
import Quiz from "../models/quizSchema.js";
import {User} from "../models/userSchema.js";
import { getGeminiQuiz } from "./geminiQuizApi.js"; // You’ll implement this next

export const generateAndPopulateQuizzes = async () => {
  try {


        const updateResult = await User.updateMany(
        {},
        { $set: { standard: "" } }
      );

      console.dir(updateResult); // 🔍 Show full structure

      if ("matchedCount" in updateResult) {
        console.log(`Matched: ${updateResult.matchedCount}`);
        console.log(`Modified: ${updateResult.modifiedCount}`);
      } else if ("acknowledged" in updateResult) {
        console.log("Update acknowledged.");
        console.log(`Modified count: ${updateResult.modifiedCount}`); // fallback
      } else {
        console.log("Unexpected update result structure:", updateResult);
      }


    // Step 1: Add quiz: false to words missing the quiz field
    const patchResult = await Word.updateMany(
      { quiz: { $exists: false } },
      { $set: { quiz: false } }
    );
    console.log(`Patched ${patchResult.modifiedCount} words missing 'quiz' field.`);

   

    // Step 2: Get all words with quiz: false and generate quizzes
    const words = await Word.find({ quiz: false });

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

