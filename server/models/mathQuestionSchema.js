import mongoose from 'mongoose';

export const mathQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  // For MCQ questions we store options and index of correct option
  options: [{ type: String, trim: true }],
  correctOptionIndex: { type: Number },
  // Backwards compatible field for single-answer or future types
  answer: { type: String, trim: true },
  classStandard: {
    type: String,
    required: true,
    enum: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12']
  },
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'mathematical-logic']
  },
  chapter: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  // Flexible question types for future expansion
  questionType: {
    type: String,
    enum: ['multiple-choice', 'fill-in-blank', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Optional static helper for aggregated stats (kept simple)
mathQuestionSchema.statics.getStatsBySubject = async function() {
  return this.aggregate([
    { $match: { } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

const MathQuestion = mongoose.model('MathQuestion', mathQuestionSchema);

export default MathQuestion;
