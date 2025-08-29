import mongoose from 'mongoose';

const assignedMathQuestionSchema = new mongoose.Schema({
  classStandard: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'class-6', 'class-7', 'class-8',
      'class-9', 'class-10', 'class-11', 'class-12'
    ]
  },
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MathQuestion',
    required: true
  }],
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AssignedMathQuestion = mongoose.model('AssignedMathQuestion', assignedMathQuestionSchema);

export default AssignedMathQuestion;
