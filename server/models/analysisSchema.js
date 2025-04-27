import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcription: {
    type: String,
    required: true
  },
  referenceText: {
    type: String,
    required: true
  },
  pronunciationScore: {
    type: Number,
    required: true
  },
  phonemeAnalysis: [{
    phoneme: String,
    score: Number,
    isCorrect: Boolean
  }],
  wer: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    default: 'en-US'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Analysis', AnalysisSchema);
