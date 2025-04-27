import { speechShadowService } from '../services/speechShadow/index.js';
import { v4 as uuidv4 } from 'uuid';

const shadowService = speechShadowService();

const speechShadowController = {
  async synthesizeSpeech(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ success: false, message: 'Text is required' });
      }

      const audioUrl = await shadowService.textToSpeech(text); 


      res.json({
        success: true,
        audioUrl,
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to synthesize speech',
        error: error.message,
      });
    }
  },

  async analyzeRecording(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Audio file is required' });
      }

      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: 'Reference text is required' });
      }

      const fileName = `user_${uuidv4()}.wav`;
      const recordingUrl = await shadowService.uploadToFirebase(req.file.buffer, fileName);

      const analysisId = await shadowService.submitForAnalysis(text, recordingUrl);

      res.json({
        success: true,
        analysisId,
        recordingUrl,
        message: 'Analysis in progress',
      });
    } catch (error) {
      console.error('Error analyzing recording:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze recording', error: error.message });
    }
  },

  async getAnalysisResults(req, res) {
    try {
      const { textId, recordingId } = req.query;

      if (!textId || !recordingId) {
        return res.status(400).json({
          success: false,
          message: 'Text ID and recording ID are required',
        });
      }

      const results = await shadowService.getAnalysisResults(textId, recordingId);

      if (!results) {
        return res.status(404).json({
          success: false,
          message: 'Analysis results not found or still processing',
        });
      }

      res.json({ success: true, ...results });
    } catch (error) {
      console.error('Error retrieving analysis results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analysis results',
        error: error.message,
      });
    }
  },
};

export default speechShadowController;
