import mongoose from 'mongoose';

export const scienceQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  classStandard: {
    type: String,
    required: true,
    enum: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12']
  },
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'physics', 'chemistry', 'biology', 'science', 'social-science']
  },
  chapter: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  questionType: {
    type: String,
    enum: ['fill-in-blank', 'multiple-choice', 'true-false', 'short-answer'],
    default: 'fill-in-blank'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { timestamps: true });

const ScienceQuestion = mongoose.model('ScienceQuestion', scienceQuestionSchema);

export default ScienceQuestion;
