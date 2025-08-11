import { getAllUsers, getUserById, assignWordToUser, assignWordToBulkUsers,removeWordFromUser, deleteUserById,
  deleteUsersByIds, addPointsService, getUserPointsService, getQuizQuestionsService  } from '../services/user/index.js';

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
    const { word} = req.body;
    console.log('Assigning word in controller:', word);
    const result = await assignWordToUser(req.params.userId, { word, subject: 'English' });
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
    
    res.status(200).json({
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

// DELETE a single user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUserId: deletedUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// DELETE multiple users
export const deleteBulkUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds must be a non-empty array' });
    }

    const result = await deleteUsersByIds(userIds);
    res.status(200).json({
      message: 'Bulk deletion completed',
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
      notFoundIds: result.notFoundIds,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting users', error: error.message });
  }
};


export const addPoints = async (req, res) => {
  const { userId, points, reason } = req.body;

  try {
    const updatedUser = await addPointsService(userId, points, reason);
    res.status(200).json({
      message: `${points} points added for ${reason}`,
      totalPoints: updatedUser.points,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserPoints = async (req, res) => {
  const userId = req.params.userId;
  console.log('Fetching points with user ID:', userId);

  try {
    const users = await getUserPointsService(userId);
    console.log('Fetched users in controller:', users);
    if (!users) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getQuizQuestions = async (req, res) => {
  try {
    const { uid } = req.params;
    const questions = await getQuizQuestionsService(uid);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};