import mongoose from 'mongoose';

const assignedScienceQuestionSchema = new mongoose.Schema({
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
    ref: 'ScienceQuestion',
    required: true
  }],
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const AssignedScienceQuestion = mongoose.model('AssignedScienceQuestion', assignedScienceQuestionSchema);

export default AssignedScienceQuestion;
