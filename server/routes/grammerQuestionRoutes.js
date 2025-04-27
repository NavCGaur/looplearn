import express from 'express';
import { getGrammerQuestions, submitGrammerAnswers } from '../controllers/grammerQuestionController.js';

const router = express.Router();

router.get('/', getGrammerQuestions);
router.post('/submit', submitGrammerAnswers);

export default router;
