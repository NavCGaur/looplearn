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

      // If user doesn't exist in MongoDB, create them with default role
      if (!userFromDB) {
        userFromDB = await User.create({
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          role: 'Guest' // Default role
        });

        await assignInitialWords(userFromDB._id);
      }

      // Return user data, including role for RBAC
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name || userFromDB.displayName,
        photoURL: decodedToken.picture || userFromDB.photoURL,
        role: userFromDB.role,
        createdAt: userFromDB.createdAt
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
