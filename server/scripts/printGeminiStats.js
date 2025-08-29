import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
import { getGeminiStats } from '../utility/geminiQuizApi.js';

console.log('Gemini stats:', getGeminiStats());
