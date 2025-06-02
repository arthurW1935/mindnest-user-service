const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const { logActivity } = require('../utils/activityLogger');

class PreferencesController {
  // Get current user's preferences
  static async getCurrentUserPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let preferences = await UserPreferences.findByUserId(user.id);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await UserPreferences.create(user.id);
      }

      res.json({
        success: true,
        data: {
          preferences
        }
      });
    } catch (error) {
      console.error('Error getting current user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preferences'
      });
    }
  }

  // Get user preferences by ID
  static async getUserPreferences(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      let preferences = await UserPreferences.findByUserId(userId);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await UserPreferences.create(userId);
      }

      res.json({
        success: true,
        data: {
          preferences
        }
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preferences'
      });
    }
  }

  // Update current user's preferences
  static async updateCurrentUserPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const preferencesData = req.body;
      const updatedPreferences = await UserPreferences.upsert(user.id, preferencesData);

      // Log activity
      await logActivity(user.id, 'preferences_update', 'User preferences updated', {
        updated_fields: Object.keys(preferencesData)
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences: updatedPreferences
        }
      });
    } catch (error) {
      console.error('Error updating current user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      });
    }
  }

  // Update user preferences by ID
  static async updateUserPreferences(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const preferencesData = req.body;
      const updatedPreferences = await UserPreferences.upsert(userId, preferencesData);

      // Log activity
      await logActivity(userId, 'preferences_update', 'User preferences updated', {
        updated_fields: Object.keys(preferencesData),
        updated_by: req.user.role === 'psychiatrist' ? 'psychiatrist' : 'self'
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences: updatedPreferences
        }
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      });
    }
  }

  // Get notification preferences only
  static async getNotificationPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let notificationPreferences = await UserPreferences.getNotificationPreferences(user.id);
      
      // Create default preferences if none exist
      if (!notificationPreferences) {
        await UserPreferences.create(user.id);
        notificationPreferences = await UserPreferences.getNotificationPreferences(user.id);
      }

      res.json({
        success: true,
        data: {
          notifications: notificationPreferences
        }
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification preferences'
      });
    }
  }

  // Update notification preferences only
  static async updateNotificationPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const notificationData = req.body;
      const updatedNotifications = await UserPreferences.updateNotificationPreferences(user.id, notificationData);

      // Log activity
      await logActivity(user.id, 'notification_preferences_update', 'Notification preferences updated', {
        updated_fields: Object.keys(notificationData)
      });

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          notifications: updatedNotifications
        }
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences'
      });
    }
  }

  // Get privacy preferences only
  static async getPrivacyPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let privacyPreferences = await UserPreferences.getPrivacyPreferences(user.id);
      
      // Create default preferences if none exist
      if (!privacyPreferences) {
        await UserPreferences.create(user.id);
        privacyPreferences = await UserPreferences.getPrivacyPreferences(user.id);
      }

      res.json({
        success: true,
        data: {
          privacy: privacyPreferences
        }
      });
    } catch (error) {
      console.error('Error getting privacy preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get privacy preferences'
      });
    }
  }

  // Update privacy preferences only
  static async updatePrivacyPreferences(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const privacyData = req.body;
      const updatedPrivacy = await UserPreferences.updatePrivacyPreferences(user.id, privacyData);

      // Log activity
      await logActivity(user.id, 'privacy_preferences_update', 'Privacy preferences updated', {
        updated_fields: Object.keys(privacyData)
      });

      res.json({
        success: true,
        message: 'Privacy preferences updated successfully',
        data: {
          privacy: updatedPrivacy
        }
      });
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update privacy preferences'
      });
    }
  }

  // Reset preferences to default
  static async resetPreferencesToDefault(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const resetPreferences = await UserPreferences.resetToDefault(user.id);

      // Log activity
      await logActivity(user.id, 'preferences_reset', 'Preferences reset to default');

      res.json({
        success: true,
        message: 'Preferences reset to default successfully',
        data: {
          preferences: resetPreferences
        }
      });
    } catch (error) {
      console.error('Error resetting preferences to default:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset preferences to default'
      });
    }
  }
}

module.exports = PreferencesController;