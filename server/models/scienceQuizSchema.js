import mongoose from 'mongoose';

export const scienceQuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classStandard: {
    type: String,
    required: true,
    enum: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12']
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScienceQuestion',
      required: true
    },
    userAnswer: String,
    isCorrect: Boolean
  }],
  subject: {
    type: String,
    required: true
  },
  score: {
    correct: { type: Number, default: 0 },
    total: { type: Number, required: true },
    percentage: Number
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  }
}, { timestamps: true });
