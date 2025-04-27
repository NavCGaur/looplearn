// models/Word.js
import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  definition: { type: String, required: true },
  wordHindi: { type: String },
  definitionHindi: { type: String },
  exampleSentence: { type: String },
  exampleSentenceHindi: { type: String },
  difficulty: { type: Number, default: 1 }, // For future leveling
  partOfSpeech: { type: String }, // e.g., noun, verb
  pronunciationUrl:{ type: String }, // URL to audio pronunciation
});

export default mongoose.model("Word", wordSchema);
