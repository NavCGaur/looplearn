import {UserSchema} from '../../models/userSchema.js';
import mongoose from 'mongoose';
import { differenceInDays } from 'date-fns';

const User = mongoose.model('User', UserSchema);


const statsService = {
    getVocabularyStats: async (userId) => {
      console.log("userId in service", userId);
      const user = await User.findOne({ uid: userId });
      
      if (!user) {
        throw new Error('User not found');
      }
  
      // Calculate total words
      const totalWords = user.vocabulary.length;
  
      // Find last review date
      let lastReviewDate = null;
      user.vocabulary.forEach(word => {
        if (word.lastReviewed && (!lastReviewDate || word.lastReviewed > lastReviewDate)) {
          lastReviewDate = word.lastReviewed;
        }
      });
  
      // Calculate days since last review
      const daysSinceLastReview = lastReviewDate 
        ? differenceInDays(new Date(), new Date(lastReviewDate))
        : null;
  
      // Find next review date (closest one in the future)
      const now = new Date();
      let nextReviewDate = null;
      user.vocabulary.forEach(word => {
        if (word.nextReviewDate && new Date(word.nextReviewDate) > now) {
          if (!nextReviewDate || new Date(word.nextReviewDate) < new Date(nextReviewDate)) {
            nextReviewDate = word.nextReviewDate;
          }
        }
      });
  
      // Calculate average rating
      let totalRating = 0;
      let ratedWordsCount = 0;
      
      user.vocabulary.forEach(word => {
        if (word.rating > 0) {
          totalRating += word.rating;
          ratedWordsCount++;
        }
      });
      
      const averageRating = ratedWordsCount > 0 ? totalRating / ratedWordsCount : 0;
  
      // Calculate additional stats for improvement recommendations
      const lowRatedWords = user.vocabulary.filter(word => word.rating <= 2).length;
      const highRatedWords = user.vocabulary.filter(word => word.rating >= 4).length;
      const recentlyAddedWords = user.vocabulary.filter(
        word => differenceInDays(new Date(), new Date(word.addedAt)) <= 7
      ).length;
  
      return {
        totalWords,
        daysSinceLastReview: daysSinceLastReview || 0,
        nextReviewDate,
        averageRating,
        lowRatedWords,
        highRatedWords,
        recentlyAddedWords
      };
    }
  };
  
  export default statsService;
  
