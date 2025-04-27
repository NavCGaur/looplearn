import express from 'express';
import speechShadowController from '../controllers/speechShadowController.js';
import multer from 'multer';

// Set up multer for handling multipart/form-data (audio files)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

console.log("inside speech shadow routes")

// Generate speech from text using Azure TTS
router.post('/synthesize',  speechShadowController.synthesizeSpeech);

// Analyze user recording compared to reference text
router.post('/analyze', upload.single('audio'), speechShadowController.analyzeRecording);

// Get analysis results
router.get('/analysis',speechShadowController.getAnalysisResults);

export default router;
