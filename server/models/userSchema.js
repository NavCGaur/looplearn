import mongoose from "mongoose";

const userWordSchema = new mongoose.Schema({
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word" }, // Reference to Word
  rating: { type: Number, default: 0 }, // Recall score (0–5)
  lastReviewed: { type: Date },
  nextReviewDate: { type: Date },
  addedAt: { type: Date, default: Date.now }
});


export const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  
  // Vocabulary tracking
  vocabulary: [userWordSchema],
  
  // User profile
  displayName: { type: String },
  photoURL: { type: String },
  
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


  