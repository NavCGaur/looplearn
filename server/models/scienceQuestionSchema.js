import mongoose from 'mongoose';

const scienceQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  classStandard: {
    type: String,
    required: true,
    enum: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12']
  },
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'physics', 'chemistry', 'biology', 'science']
  },
  chapter: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['fill-in-blank', 'multiple-choice', 'true-false', 'short-answer'],
    default: 'fill-in-blank'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // Uncomment if you have user authentication
  },
  metadata: {
    generationMethod: {
      type: String,
      enum: ['ai-generated', 'manual', 'imported'],
      default: 'ai-generated'
    },
    aiModel: {
      type: String,
      default: 'gemini'
    },
    generationTimestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
scienceQuestionSchema.index({ classStandard: 1, subject: 1, chapter: 1 });
scienceQuestionSchema.index({ topic: 1, questionType: 1 });
scienceQuestionSchema.index({ createdAt: -1 });
scienceQuestionSchema.index({ isActive: 1 });

// Virtual for question difficulty based on class
scienceQuestionSchema.virtual('suggestedDifficulty').get(function() {
  const classNumber = parseInt(this.classStandard.split('-')[1]);
  if (classNumber <= 7) return 'easy';
  if (classNumber <= 9) return 'medium';
  return 'hard';
});

// Pre-save middleware to auto-generate tags
scienceQuestionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('chapter') || this.isModified('topic')) {
    this.tags = [
      this.subject,
      this.chapter.toLowerCase().replace(/\s+/g, '-'),
      this.topic.toLowerCase().replace(/\s+/g, '-'),
      this.classStandard
    ];
  }
  next();
});

// Static methods
scienceQuestionSchema.statics.findByClassAndSubject = function(classStandard, subject) {
  return this.find({ classStandard, subject, isActive: true });
};

scienceQuestionSchema.statics.findByTopic = function(topic, limit = 10) {
  return this.find({ 
    topic: new RegExp(topic, 'i'), 
    isActive: true 
  }).limit(limit);
};

scienceQuestionSchema.statics.getStatsBySubject = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: '$subject',
      count: { $sum: 1 },
      classes: { $addToSet: '$classStandard' },
      chapters: { $addToSet: '$chapter' }
    }},
    { $sort: { count: -1 } }
  ]);
};

const ScienceQuestion = mongoose.model('ScienceQuestion', scienceQuestionSchema);

export default ScienceQuestion;