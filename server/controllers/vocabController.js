import { fetchUserWordsDue } from '../services/vocab/vocabService.js';
import { updateMultipleUserWordRatings } from '../services/vocab/vocabService.js';


const vocabController= {

    getPracticeWords : async (req, res) => {

      console.log("Fetching practice words for user in controller:", req.query.userId);
        const {userId} = req.query; 
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        try {
          const words = await fetchUserWordsDue(userId);
          console.log("Fetched words in controller:", words);
          res.json(words);
        } catch (err) {
          res.status(500).json({ message: 'Error fetching words' });
        }
      },

      submitRatings: async (req, res) => {
        const { userId, ratings } = req.body;
    
 
        if (!userId || !Array.isArray(ratings)) {
          return res.status(400).json({ message: 'Invalid payload' });
        }
    
        try {
          await updateMultipleUserWordRatings(userId, ratings);
          res.status(200).json({ message: 'Ratings updated successfully' });
        } catch (error) {
          console.error('Error submitting ratings:', error);
          res.status(500).json({ message: 'Server error updating ratings' });
        }
      }
}

export default vocabController