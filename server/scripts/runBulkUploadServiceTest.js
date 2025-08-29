import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { bulkUploadQuestionsService } from '../services/math/mathService.js';

const sampleQuestions = [
  {
    questionText: 'What is 9 + 4?',
    options: ['12','13','14','15'],
    correctOptionIndex: 1,
    classStandard: 'class-6',
    subject: 'mathematics',
    chapter: 'Numbers',
    topic: 'Addition',
    questionType: 'multiple-choice',
    difficulty: 'easy'
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
    const result = await bulkUploadQuestionsService(sampleQuestions);
    console.log('bulkUploadQuestionsService result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

run();
