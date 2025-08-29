import dotenv from 'dotenv';
import path from 'path';
// Ensure we load the server/.env even when running this script from workspace root
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

import mongoose from 'mongoose';
import { assignWordToUser } from '../services/user/index.js';

const run = async () => {
  try {
    console.log('Connecting to Mongo...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected.');

    const testUid = process.env.TEST_USER_UID || 'test-user-uid-123';
    const payload = { word: 'serendipity, ephemeral', subject: 'English' };

    console.log('Assigning words to test user:', testUid, payload.word);
    const results = await assignWordToUser(testUid, payload);
    console.log('Results:', JSON.stringify(results, null, 2));

    // Close DB
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
};

run();
