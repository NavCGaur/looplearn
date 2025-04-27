import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const quizQuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ['wordToDefinition', 'definitionToWord'],
    required: true
  },
  word: { type: String }, // used in wordToDefinition
  definition: { type: String, required: true },
  correctWord: { type: String }, // used in definitionToWord
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  options: [optionSchema],
  createdAt: { type: Date, default: Date.now }
});

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

export default QuizQuestion;
