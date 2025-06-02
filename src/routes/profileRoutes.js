const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken, requireSelfAccess } = require('../middleware/auth');
const { validate, userProfileSchema } = require('../middleware/validation');

// Import controllers
const ProfileController = require('../controllers/profileController');

// All routes require authentication
router.use(verifyToken);

// Get current user's profile
router.get('/me', ProfileController.getCurrentUserProfile);

// Get user profile by ID (self-access or psychiatrist)
router.get('/:userId', requireSelfAccess, ProfileController.getUserProfile);

// Create or update current user's profile
router.put('/me', validate(userProfileSchema), ProfileController.updateCurrentUserProfile);

// Update user profile by ID (self-access or psychiatrist)
router.put('/:userId', requireSelfAccess, validate(userProfileSchema), ProfileController.updateUserProfile);

// Get profile picture URL
router.get('/me/picture', ProfileController.getProfilePicture);

// Get profile completion status
router.get('/me/completion', ProfileController.getProfileCompletion);

module.exports = router;