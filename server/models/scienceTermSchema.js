import mongoose from 'mongoose';

export const ScienceTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pronunciationUrl: {
    type: String,
    required: false
  },
  definition: {
    type: String,
    required: true
  },
  simpleExplanation: {
    type: String,
    required: false
  },
  explanationHindi: {
    type: String,
    required: false
  },
  analogy: {
    type: String,
    required: false
  },
  relatedConcepts: [
    {
      type: String
    }
  ],
  image: {
    type: String // URL or filename stored in cloud or local
  },
  category: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Biology', 'General Science']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ScienceTerm', ScienceTermSchema);