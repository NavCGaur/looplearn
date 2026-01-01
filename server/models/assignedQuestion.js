import mongoose from 'mongoose';

const AssignedQuestionSchema = new mongoose.Schema({
  // Grouping fields - one document per class+subject+chapter combination
  classStandard: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  chapter: { type: String, default: null, index: true }, // null means "all chapters"
  
  // Array of assigned question IDs - this is the key efficiency improvement
  questionIds: [{ 
    type: String, 
    required: true 
  }],
  
  // Metadata for tracking
  assignedBy: { type: String, default: null },
  lastModified: { type: Date, default: () => new Date() },
  totalQuestions: { type: Number, default: 0 }, // cached count for quick access
  
  // Optional metadata
  meta: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { 
  timestamps: true,
  // Optimize for array operations
  minimize: false 
});

// Compound unique index - one document per class+subject+chapter combination
AssignedQuestionSchema.index({ 
  classStandard: 1, 
  subject: 1, 
  chapter: 1 
}, { 
  unique: true,
  name: 'unique_assignment_group'
});

// Index for quick lookups
AssignedQuestionSchema.index({ 
  subject: 1, 
  classStandard: 1 
}, {
  name: 'subject_class_lookup'
});

// Index on questionIds array for efficient contains queries
AssignedQuestionSchema.index({ 
  questionIds: 1 
}, {
  name: 'question_ids_lookup'
});

// Pre-save middleware to update totalQuestions count
AssignedQuestionSchema.pre('save', function(next) {
  this.totalQuestions = this.questionIds ? this.questionIds.length : 0;
  this.lastModified = new Date();
  next();
});

// Static method to check if a question is assigned
AssignedQuestionSchema.statics.isQuestionAssigned = async function(questionId, classStandard, subject) {
  const result = await this.findOne({
    classStandard,
    subject,
    questionIds: questionId
  }).lean();
  return !!result;
};

// Static method to get assigned questions for multiple criteria
AssignedQuestionSchema.statics.getAssignedQuestionIds = async function(classStandard, subject, chapter = null) {
  const query = { classStandard, subject };
  if (chapter) query.chapter = chapter;
  
  const assignments = await this.find(query).lean();
  const allQuestionIds = assignments.reduce((acc, assignment) => {
    return acc.concat(assignment.questionIds || []);
  }, []);
  
  return [...new Set(allQuestionIds)]; // Remove duplicates
};

// Static method to add questions to assignment
AssignedQuestionSchema.statics.addQuestions = async function(classStandard, subject, chapter, questionIds) {
  const filter = { classStandard, subject, chapter };
  const update = {
    $addToSet: { questionIds: { $each: questionIds } }, // Add only unique IDs
    $set: { lastModified: new Date() }
  };
  
  const result = await this.findOneAndUpdate(
    filter,
    update,
    { 
      upsert: true, 
      new: true, 
      setDefaultsOnInsert: true 
    }
  );
  
  return result;
};

// Static method to remove questions from assignment
AssignedQuestionSchema.statics.removeQuestions = async function(classStandard, subject, chapter, questionIds) {
  const filter = { classStandard, subject, chapter };
  const update = {
    $pullAll: { questionIds: questionIds },
    $set: { lastModified: new Date() }
  };
  
  const result = await this.findOneAndUpdate(
    filter,
    update,
    { new: true }
  );
  
  // Remove document if no questions left
  if (result && (!result.questionIds || result.questionIds.length === 0)) {
    await this.deleteOne({ _id: result._id });
    return null;
  }
  
  return result;
};

const AssignedQuestion = mongoose.models.AssignedQuestion || mongoose.model('AssignedQuestion', AssignedQuestionSchema);

export default AssignedQuestion;
