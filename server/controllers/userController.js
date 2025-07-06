import { getAllUsers, getUserById, assignWordToUser, assignWordToBulkUsers,removeWordFromUser } from '../services/user/index.js';

export const getUsers = async (req, res) => {
  console.log('Fetching all users in controller...');

  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  console.log('Fetching user by ID in controller...', req.params.userId);
  try {
    const user = await getUserById(req.params.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const assignWord = async (req, res) => {
  try {
    const { word } = req.body;
    const result = await assignWordToUser(req.params.userId, { word });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// bulk assignment controller
export const bulkAssignWord = async (req, res) => {
  try {
    const { userIds, wordData } = req.body;
    
    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        message: 'userIds array is required and must not be empty' 
      });
    }
    
    if (!wordData || !wordData.word) {
      return res.status(400).json({ 
        message: 'wordData with word property is required' 
      });
    }
    
    // Call the bulk assignment service
    const result = await assignWordToBulkUsers(userIds, wordData);
    
    res.status(201).json({
      message: 'Bulk assignment completed',
      results: result.results,
      successCount: result.successCount,
      failureCount: result.failureCount,
      word: wordData.word
    });
    
  } catch (error) {
    console.error('Bulk assignment error:', error);
    res.status(500).json({ 
      message: 'Internal server error during bulk assignment',
      error: error.message 
    });
  }
};


export const removeWord = async (req, res) => {
  try {
    await removeWordFromUser(req.params.userId, req.params.wordId);
    res.status(200).json({ message: 'Word removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};