/**
 * Quick cleanup script for AssignedQuestion collection
 * Run this with: node cleanupAssignedQuestions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupOldAssignedQuestions = async () => {
  try {
    console.log('🧹 Starting cleanup of old AssignedQuestion documents...');
    
    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get the collection directly
    const db = mongoose.connection.db;
    const collection = db.collection('assignedquestions');
    
    // Count existing documents
    const count = await collection.countDocuments();
    console.log(`📊 Found ${count} existing documents`);

    if (count > 0) {
      // Delete all documents in the collection
      const result = await collection.deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} old documents`);
      
      // Drop indexes (they'll be recreated with new schema)
      try {
        await collection.dropIndexes();
        console.log('📋 Dropped old indexes');
      } catch (e) {
        console.log('ℹ️  No indexes to drop or already dropped');
      }
      
      console.log('✅ Cleanup completed successfully!');
      console.log('🎯 You can now use the new scalable AssignedQuestion schema');
    } else {
      console.log('ℹ️  Collection is already empty, nothing to clean up');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

cleanupOldAssignedQuestions();
