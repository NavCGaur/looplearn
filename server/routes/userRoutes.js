import express from 'express';
import { getUsers, getUser, assignWord,bulkAssignWord, removeWord, deleteUser, deleteBulkUsers, addPoints, getUserPoints, getQuizQuestions   } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get a specific user
router.get('/:userId', getUser);

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
router.get("/points/:userId", getUserPoints);

/**
 * Get /api/questions/:uid
 * Get questions for a user
 */
router.get('/questions/:uid', getQuizQuestions);


export default router;
