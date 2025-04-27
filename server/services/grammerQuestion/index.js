import GrammarQuestion from '../../models/grammarQuestionSchema.js';
import { UserSchema } from '../../models/userSchema.js'; 
import mongoose from 'mongoose';

const User = mongoose.model('User', UserSchema);

export const fetchGrammerQuestions = async (userId) => {
  
    try {
      const user = await User.findOne({ uid: userId });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      let questionCount = 5; // default for Guest
  
      if (user.role === 'Admin') questionCount = 15;
      else if (user.role === 'Subscriber') questionCount = 10;
  
      const questions = await GrammarQuestion.aggregate([
        { $sample: { size: questionCount } }
      ]);
  
      return questions;
  
    } catch (error) {
      console.error("Database error while fetching questions:", error.message);
      throw new Error("Failed to retrieve questions");
    }
  };

export const evaluateGrammerAnswers = async (answers) => {
  try {
    const questions = await GrammarQuestion.find();

    if (questions.length !== answers.length) {
      throw new Error("Mismatch between submitted answers and question count");
    }

    const score = questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    return {
      score,
      totalQuestions: questions.length,
      percentage: (score / questions.length) * 100,
    };
  } catch (error) {
    console.error("Error while evaluating answers:", error.message);
    throw new Error("Failed to process submitted answers");
  }
};
