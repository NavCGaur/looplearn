import {admin} from '../../config/firebase/index.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserSchema } from '../../models/userSchema.js';
import Word from "../../models/wordSchema.js";

dotenv.config(); // Load environment variables


// Define User model
const User = mongoose.model('User', UserSchema, 'NeurolingvaUsers');



// ---- Utility Function: Assign Initial Words ----
const assignInitialWords = async (userId, wordCount = 5) => {
  try {
    const words = await Word.aggregate([{ $sample: { size: wordCount } }]);

    const spacedWords = words.map(word => ({
      wordId: word._id,
      rating: 0,
      lastReviewed: null,
      nextReviewDate: null,
      addedAt: new Date(),
    }));

    await User.findByIdAndUpdate(userId, {
      $push: { vocabulary: { $each: spacedWords } }
    });

    console.log(`Assigned ${wordCount} words to user ${userId}`);
  } catch (error) {
    console.error("Error assigning initial words:", error);
  }
};

// ---- Authentication Service ----
const authService = {
  /**
   * Verify Firebase ID token
   * @param {string} token - Firebase ID token
   * @returns {Object} - User data
   */
  verifyFirebaseToken: async (token) => {
    if (!token) throw new Error('Token is required');
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      let userFromDB = await User.findOne({ uid: decodedToken.uid });
  
      if (!userFromDB) {
        userFromDB = await User.create({
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          role: 'Guest'
        });
        await assignInitialWords(userFromDB._id);
        userFromDB = await User.findById(userFromDB._id).populate('vocabulary.wordId');
      }
  
      // Populate with all word fields, filtering out null wordIds
      const populatedUser = await User.findById(userFromDB._id)
        .populate({
          path: 'vocabulary.wordId',
          model: 'Word',
          select: 'word definition wordHindi definitionHindi exampleSentence exampleSentenceHindi difficulty partOfSpeech pronunciationUrl _id'
        })
        .lean()
        .exec();
  
      // Safely transform vocabulary, filtering out items with null wordId
      const transformedVocabulary = populatedUser.vocabulary
        .filter(item => item.wordId !== null && item.wordId !== undefined) // Filter out null wordIds
        .map(item => ({
          _id: item._id,
          rating: item.rating,
          lastReviewed: item.lastReviewed,
          nextReviewDate: item.nextReviewDate,
          addedAt: item.addedAt,
          wordId: {
            _id: item.wordId._id,
            word: item.wordId.word,
            definition: item.wordId.definition,
            wordHindi: item.wordId.wordHindi,
            definitionHindi: item.wordId.definitionHindi,
            exampleSentence: item.wordId.exampleSentence,
            exampleSentenceHindi: item.wordId.exampleSentenceHindi,
            difficulty: item.wordId.difficulty,
            partOfSpeech: item.wordId.partOfSpeech,
            pronunciationUrl: item.wordId.pronunciationUrl
          }
        }));
  
      console.log('Successfully populated user vocabulary');
      console.log('populatedUser:', populatedUser);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name || populatedUser.displayName,
        photoURL: decodedToken.picture || populatedUser.photoURL,
        vocabulary: transformedVocabulary,
        role: populatedUser.role,
        classStandard: populatedUser.classStandard,
        createdAt: populatedUser.createdAt,
        planId: populatedUser.planId,
        subscriptionStatus: populatedUser.subscriptionStatus,
        currentPeriodEnd: populatedUser.currentPeriodEnd

      };
    } catch (error) {
      console.error('Firebase token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Create a new user in the database
   * @param {Object} userData - User data
   * @returns {Object} - Created user data
   */
  createUser: async (userData) => {
    try {
      const { uid, email, displayName, photoURL, role = 'user' } = userData;

      if (!uid || !email) throw new Error('UID and Email are required to create a user');

      // Check if the user already exists
      const existingUser = await User.findOne({ uid });
      if (existingUser) return existingUser;

      // Create new user in MongoDB
      return await User.create({
        uid,
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        role
      });
    } catch (error) {
      console.error('User creation error:', error);
      throw new Error('Error creating user');
    }
  }
};

export default authService;
