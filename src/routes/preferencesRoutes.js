const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken, requireSelfAccess } = require('../middleware/auth');
const { validate, userPreferencesSchema } = require('../middleware/validation');

// Import controllers
const PreferencesController = require('../controllers/preferencesController');

// All routes require authentication
router.use(verifyToken);

// Get current user's preferences
router.get('/me', PreferencesController.getCurrentUserPreferences);

// Get user preferences by ID (self-access or psychiatrist)
router.get('/:userId', requireSelfAccess, PreferencesController.getUserPreferences);

// Update current user's preferences
router.put('/me', validate(userPreferencesSchema), PreferencesController.updateCurrentUserPreferences);

// Update user preferences by ID (self-access or psychiatrist)
router.put('/:userId', requireSelfAccess, validate(userPreferencesSchema), PreferencesController.updateUserPreferences);

// Get notification preferences only
router.get('/me/notifications', PreferencesController.getNotificationPreferences);

// Update notification preferences only
router.put('/me/notifications', PreferencesController.updateNotificationPreferences);

// Get privacy preferences only
router.get('/me/privacy', PreferencesController.getPrivacyPreferences);

// Update privacy preferences only
router.put('/me/privacy', PreferencesController.updatePrivacyPreferences);

// Reset preferences to default
router.post('/me/reset', PreferencesController.resetPreferencesToDefault);

module.exports = router;