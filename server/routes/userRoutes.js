import express from 'express';
import { getUsers, getUser, assignWord,bulkAssignWord, removeWord } from '../controllers/userController.js';

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

export default router;
