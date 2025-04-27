import express from 'express';
import vocabController  from '../controllers/vocabController.js';
const router = express.Router();

router.get('/practice', vocabController.getPracticeWords);
router.post('/submitratings', vocabController.submitRatings);


export default router;
