import statsService from '../services/statsService/index.js';

const statsController = {
  getVocabularyStats: async (req, res) => {
    try {
      const {userId} = req.query; 
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const stats = await statsService.getVocabularyStats(userId);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching vocabulary stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve vocabulary statistics',
        error: error.message
      });
    }
  }
};

export default statsController;
