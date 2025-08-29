import dotenv from 'dotenv';
import path from 'path';
// Load server .env
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

import mongoose from 'mongoose';
import { assignWordToBulkUsers } from '../services/user/index.js';

const run = async () => {
  try {
    console.log('Connecting to Mongo...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected.');

    const testUid = process.env.TEST_USER_UID || 'test-user-uid-123';
    const userIds = [testUid];
    const payload = { word: 'eloquent, ephemeral, serendipity', subject: 'English' };

    console.log('Bulk assigning words to users:', userIds, payload.word);
    const result = await assignWordToBulkUsers(userIds, payload);
    console.log('Bulk assign results:', JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Bulk test error:', err);
    process.exit(1);
  }
};

run();
