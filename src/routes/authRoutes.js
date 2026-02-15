/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */
import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();
const userController = new UserController();

// Login endpoint
router.post('/login', userController.login.bind(userController));

// Verify token endpoint
router.get('/verify', userController.verifyToken.bind(userController));

// Create user endpoint (for initial setup)
router.post('/register', userController.createUser.bind(userController));

export default router;



