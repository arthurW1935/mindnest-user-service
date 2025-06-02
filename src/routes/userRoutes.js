const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken, requireAuth, requireSelfAccess, requirePsychiatrist, requireAdmin } = require('../middleware/auth');
const { validate, createUserSchema } = require('../middleware/validation');

// Import models
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserPreferences = require('../models/UserPreferences');

// Import controllers
const UserController = require('../controllers/UserController');

// Public routes (called by auth service)
router.post('/create', validate(createUserSchema), UserController.createUser);

// Protected routes (require authentication)
router.use(verifyToken);

// Get current user info
router.get('/me', UserController.getCurrentUser);

// Get user by ID (self-access or psychiatrist)
router.get('/:id', requireSelfAccess, UserController.getUserById);

// Update current user
router.put('/me', UserController.updateCurrentUser);

// Delete current user account
router.delete('/me', UserController.deleteCurrentUser);

// Get all users (psychiatrist only)
router.get('/', requirePsychiatrist, UserController.getAllUsers);

// Get user activity log
router.get('/:id/activities', requireSelfAccess, UserController.getUserActivities);

// Export user data (GDPR compliance)
router.get('/me/export', UserController.exportUserData);

// Search users (psychiatrist only)
router.get('/search/:query', requirePsychiatrist, UserController.searchUsers);

// Admin routes
router.get('/admin/count', requireAdmin, UserController.getUserCount);

module.exports = router;