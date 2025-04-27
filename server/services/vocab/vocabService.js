import { UserSchema } from '../../models/userSchema.js'; 
import mongoose from 'mongoose';

const User = mongoose.model('User', UserSchema);

export const fetchUserWordsDue = async (userId) => {

  try {
    const user = await User.findOne({ uid: userId }).populate('vocabulary.wordId');

    if (!user) {
      console.log("No user found with id:", userId);
      throw new Error('User not found');
    }
    console.log("User found in service:", userId, user.vocabulary.length, user.vocabulary[0].wordId.word);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to start of the day

    return user.vocabulary
      .filter(v => {
        return (
          v.wordId &&
          (!v.nextReviewDate || new Date(v.nextReviewDate).getTime() <= today.getTime())
        );
      })
      .map(v => ({
        word: v.wordId.word,
        wordHindi: v.wordId.wordHindi,
        definition: v.wordId.definition,
        definitionHindi: v.wordId.definitionHindi,
        exampleSentence: v.wordId.exampleSentence,
        exampleSentenceHindi: v.wordId.exampleSentenceHindi,
        pronunciationUrl: v.wordId.pronunciationUrl,
        difficulty: v.wordId.difficulty,
        partOfSpeech: v.wordId.partOfSpeech,
        // Optional: add rating/nextReviewDate info if needed
        rating: v.rating,
        nextReviewDate: v.nextReviewDate,
      }));
  } catch (err) {
    console.error("Error in fetchUserWordsDue:", err);
    throw err;
  }
};
 

export const updateMultipleUserWordRatings = async (userId, ratings) => {
  const user = await User.findOne({ uid: userId }).populate('vocabulary.wordId');
  if (!user) throw new Error('User not found');

  const now = new Date();

  for (const { word, rating } of ratings) {
    const vocabEntry = user.vocabulary.find(v => v.wordId && v.wordId.word === word);
    if (vocabEntry) {
      vocabEntry.rating = rating;
      vocabEntry.lastReviewed = now;
      vocabEntry.nextReviewDate = calculateNextReviewDate(rating, now);
    }
  }

  await user.save();
};

/**
 * Calculates the next review date based on the given rating and from date.
 * 
 * @param {number} rating - The rating given to the item (1-5)
 * @param {Date} fromDate - The date from which to calculate the next review date
 * @returns {Date} The calculated next review date
 */
function calculateNextReviewDate(rating, fromDate) {
  // Create a new Date object to avoid modifying the original fromDate
  const next = new Date(fromDate);

  // Determine the number of days to add to the from date based on the rating, currently returning 1 day for all ratings
  // - Rating 5: 1 days
  // - Rating 3: 1 days
  // - All other ratings: 1 day
  const days = rating === 5 ? 1 : rating === 3 ? 1 : 1;

  // Add the calculated number of days to the next date
  next.setDate(next.getDate() + days);

  // Return the calculated next review date
  return next;
}