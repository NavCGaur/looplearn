import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const grammarQuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ['sentenceCorrection', 'identifyError', 'fillInBlank', 'chooseCorrectForm'],
    required: true
  },
  sentence: { type: String, required: true }, // The base sentence for all question types
  correctAnswer: { type: String }, // The correct answer (varies by question type)
  explanation: { type: String }, // Explanation of the grammar rule
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  options: [optionSchema],
  createdAt: { type: Date, default: Date.now }
});

const GrammarQuestion = mongoose.model("GrammarQuestion", grammarQuestionSchema);

export default GrammarQuestion;