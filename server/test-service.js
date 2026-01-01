import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { listSubjects, listClasses, listChapters } from './services/questionManagerService.js';

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');
    
    console.log('Testing subjects...');
    const subjects = await listSubjects();
    console.log('Subjects:', subjects);
    
    console.log('Testing classes...');
    const classes = await listClasses();
    console.log('Classes:', classes);
    
    console.log('Testing chapters...');
    const chapters = await listChapters();
    console.log('Chapters:', chapters);
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
