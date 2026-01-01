import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AssignedQuestion from '../models/assignedQuestion.js';

dotenv.config();

/**
 * Migration script to clean up old AssignedQuestion documents and start fresh
 * with the new scalable schema structure.
 * 
 * This script will:
 * 1. Backup existing data (optional)
 * 2. Drop the old collection
 * 3. Create new indexes for the updated schema
 */

const migrateAssignedQuestions = async () => {
  try {
    console.log('🚀 Starting AssignedQuestion migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.db.collection('assignedquestions');
    
    // Check if collection exists and has documents
    const oldDocumentCount = await collection.countDocuments();
    console.log(`📊 Found ${oldDocumentCount} old documents in collection`);

    if (oldDocumentCount > 0) {
      // Optional: Create a backup before deletion
      const createBackup = true; // Set to false if you don't want backup
      
      if (createBackup) {
        console.log('💾 Creating backup of existing data...');
        const backupCollection = `assignedquestions_backup_${Date.now()}`;
        const oldDocs = await collection.find().toArray();
        
        if (oldDocs.length > 0) {
          await mongoose.connection.db.collection(backupCollection).insertMany(oldDocs);
          console.log(`✅ Backup created: ${backupCollection} (${oldDocs.length} documents)`);
        }
      }

      // Drop the old collection completely
      console.log('🗑️  Dropping old collection...');
      await collection.drop();
      console.log('✅ Old collection dropped successfully');
    } else {
      console.log('ℹ️  No old documents found, skipping cleanup');
    }

    // Create the new collection with proper indexes
    console.log('🏗️  Creating new collection with optimized indexes...');
    
    // The indexes will be created automatically when we use the model
    // But let's ensure they're created properly
    await AssignedQuestion.createIndexes();
    console.log('✅ New indexes created successfully');

    // Verify the new structure
    const indexes = await AssignedQuestion.collection.getIndexes();
    console.log('📋 Created indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}: ${JSON.stringify(indexes[indexName].key)}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 New schema structure:');
    console.log('   - One document per class+subject+chapter combination');
    console.log('   - questionIds array contains all assigned question IDs');
    console.log('   - Optimized for scalability and performance');
    console.log('\n🔄 You can now start assigning questions with the new system!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Export for programmatic use
export { migrateAssignedQuestions };

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAssignedQuestions()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}
