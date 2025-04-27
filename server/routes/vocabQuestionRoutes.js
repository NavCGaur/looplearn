import express from 'express';
import { getVocabQuestions, submitVocabAnswers } from '../controllers/vocabQuestionController.js';

const router = express.Router();

router.get('/', getVocabQuestions);
router.post('/submit', submitVocabAnswers);

export default router;
