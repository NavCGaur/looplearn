import mongoose from "mongoose";

const userWordSchema = new mongoose.Schema({
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word" }, // Reference to Word
  rating: { type: Number, default: 0 }, // Recall score (0–5)
  lastReviewed: { type: Date },
  nextReviewDate: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

const scienceWordSchema = new mongoose.Schema({
  termId: { type: mongoose.Schema.Types.ObjectId, ref: "ScienceTerm" },
  learned: { type: Boolean, default: false }, // Whether the term has been learned
  progress: { type: Number, default: 0 } // Progress percentage (0–100)
});


export const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  
  // Vocabulary tracking
  vocabulary: [userWordSchema],

  scienceWords: [scienceWordSchema],
  
  // User profile
  displayName: { type: String },
  photoURL: { type: String },

  // User points
  points: {
    type: Number,
    default: 0,
  },
  
  // Subscription related fields
  role: { type: String, enum: ['Guest', 'Admin', 'Subscriber'], default: 'Guest' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String }, 
  planId: { type: String, enum: ['free', 'pro'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', null], default: null },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },

  latestFeatureAccess: {
    vocabSpacedRepetition: Date,
    vocabQuiz: Date
  },
  
  createdAt: { type: Date, default: Date.now }
});


  