import SpeechService from '../services/speech/index.js';
import Analysis from '../models/analysisSchema.js';
import mongoose from 'mongoose';


const speechController = {
  async transcribeSpeech(req, res) {
    try {
      const { audioData, language } = req.body;

      if (!audioData) {
        return res.status(400).json({ message: 'Audio data is required' });
      }

      const transcription = await SpeechService.transcribeAudio(audioData, language || 'en-US');
      res.json({ success: true, transcription });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Transcription failed', error: error.message });
    }
  },

  async analyzePronunciation(req, res) {
    try {
      const { audioData, referenceText, language } = req.body;
      //const userId = req.user.id;

      const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"); // Use a valid 24-character hex string
      
      if (!audioData || !referenceText) {
        return res.status(400).json({ message: 'Audio data and reference text are required' });
      }

      const transcription = await SpeechService.transcribeAudio(audioData, language || 'en-US');
      const analysis = await SpeechService.analyzePronunciation(audioData, referenceText, language || 'en-US');
      const wer = await SpeechService.calculateWER(transcription, referenceText);

      const newAnalysis = new Analysis({
        userId,
        transcription,
        referenceText,
        pronunciationScore: analysis.overallScore,
        phonemeAnalysis: analysis.phonemeResults,
        wer,
        language: language || 'en-US',
        timestamp: new Date()
      });

      await newAnalysis.save();

      res.json({
        success: true,
        id: newAnalysis._id,
        transcription,
        referenceText,
        pronunciationScore: analysis.overallScore,
        phonemeAnalysis: analysis.phonemeResults,
        wer
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ message: 'Pronunciation analysis failed', error: error.message });
    }
  },

  async getUserHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await Analysis.find({ userId })
        .sort({ timestamp: -1 })
        .select('referenceText pronunciationScore wer timestamp');

      res.json({ success: true, history });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
  },

  async getAnalysisDetails(req, res) {
    try {
      const analysisId = req.params.id;
      const userId = req.user.id;

      const analysis = await Analysis.findOne({ _id: analysisId, userId });

      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }

      res.json({ success: true, analysis });
    } catch (error) {
      console.error('Error fetching analysis details:', error);
      res.status(500).json({ message: 'Failed to fetch analysis details', error: error.message });
    }
  }
};

export default speechController;
