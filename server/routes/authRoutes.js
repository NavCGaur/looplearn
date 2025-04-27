import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Route to verify Firebase token
router.post('/verify-token', authController.verifyToken);

// Route to register a new user
router.post('/register', authController.registerUser);

export default router;
