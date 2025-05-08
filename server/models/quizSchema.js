import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word", required: true },
  word: { type: String, required: true },

  mcq: {
    question: String,
    options: [String],
    correctAnswer: String,
  },

  fillInTheBlank: {
    question: String,
    answer: String,
  },
});

export default mongoose.model("Quiz", quizSchema);
