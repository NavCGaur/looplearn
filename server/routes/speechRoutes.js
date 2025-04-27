import express from 'express';
import speechController  from '../controllers/speechController.js';

const router = express.Router();

// Speech analysis routes
router.post('/transcribe', speechController.transcribeSpeech);
router.post('/analyze', speechController.analyzePronunciation);
router.get('/history', speechController.getUserHistory);
router.get('/details/:id', speechController.getAnalysisDetails);

export default router;
