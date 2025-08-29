import express from 'express';
import { 
  getUsers, 
  getUser, 
  assignWord,
  bulkAssignWord, 
  removeWord, 
  deleteUser, 
  deleteBulkUsers, 
  addPoints, 
  getUserPoints, 
  getUsersPointsAll,
  getQuizQuestions,
  getUsersByClass,
  assignWordToClass,
  updateUserClass,
  updateUserProfile
} from '../controllers/userController.js';
import { authenticateUser as authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);


// Assign a word to a user
router.post('/:userId/words', assignWord);

//bulk assignment route
router.post('/bulk-assign-word', bulkAssignWord);


// Remove a word from a user
router.delete('/:userId/words/:wordId', removeWord);

/**
 * DELETE /api/users/:id
 * Delete a single user
 */
router.delete('/delete/:id', deleteUser);

/**
 * DELETE /api/users/bulk-delete
 * Delete multiple users
 */
router.delete('/bulk-delete', deleteBulkUsers);

/**
 * POST /api/users/addPoints
 * Add points to a user
 */
router.post("/addPoints", addPoints);

/**
 * GET /api/users/points    
 * Get points for a user
 */
// Get points for a specific user
router.get('/points/:userId', getUserPoints);

// Get leaderboard - all users' points
router.get('/points', getUsersPointsAll);

/**
 * GET /api/users/questions/:uid
 * Get questions for a user
 */
router.get('/questions/:uid', getQuizQuestions);

/**
 * GET /api/users/class/:classStandard
 * Get users by class standard
 */
router.get('/class/:classStandard', getUsersByClass);

/**
 * POST /api/users/class/:classStandard/assign-word
 * Assign word to all users in a class
 */
router.post('/class/:classStandard/assign-word', assignWordToClass);

/**
 * PUT /api/users/:userId/class
 * Update user's class standard
 */
router.put('/:userId/class', updateUserClass);

// Get a specific user (placed after static routes to avoid shadowing)
router.get('/:userId', getUser);

/**
 * PUT /api/users/update-profile
 * Update user profile (for onboarding)
 */
router.put('/update-profile', authenticate, updateUserProfile);


export default router;
