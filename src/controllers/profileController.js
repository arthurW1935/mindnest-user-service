const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const { logActivity } = require('../utils/activityLogger');

class ProfileController {
  // Get current user's profile
  static async getCurrentUserProfile(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const profile = await UserProfile.findByUserId(user.id);
      const completionPercentage = await UserProfile.getCompletionPercentage(user.id);

      // Generate profile picture URL
      let profilePictureUrl = null;
      if (profile && (profile.first_name || profile.last_name)) {
        profilePictureUrl = ProfileController.generateProfilePictureUrl(
          profile.first_name,
          profile.last_name
        );
      }

      res.json({
        success: true,
        data: {
          profile: {
            ...(profile || {}),
            profile_picture_url: profilePictureUrl
          },
          completion_percentage: completionPercentage
        }
      });
    } catch (error) {
      console.error('Error getting current user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  // Get user profile by ID
  static async getUserProfile(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await UserProfile.findByUserId(userId);
      const completionPercentage = await UserProfile.getCompletionPercentage(userId);

      // Generate profile picture URL
      let profilePictureUrl = null;
      if (profile && (profile.first_name || profile.last_name)) {
        profilePictureUrl = ProfileController.generateProfilePictureUrl(
          profile.first_name,
          profile.last_name
        );
      }

      res.json({
        success: true,
        data: {
          profile: {
            ...(profile || {}),
            profile_picture_url: profilePictureUrl
          },
          completion_percentage: completionPercentage
        }
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  // Update current user's profile
  static async updateCurrentUserProfile(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const profileData = req.body;
      const updatedProfile = await UserProfile.upsert(user.id, profileData);

      // Generate profile picture URL if name fields are provided
      let profilePictureUrl = null;
      if (updatedProfile.first_name || updatedProfile.last_name) {
        profilePictureUrl = ProfileController.generateProfilePictureUrl(
          updatedProfile.first_name,
          updatedProfile.last_name
        );
      }

      // Log activity
      await logActivity(user.id, 'profile_update', 'User profile updated', {
        updated_fields: Object.keys(profileData)
      });

      const completionPercentage = await UserProfile.getCompletionPercentage(user.id);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: {
            ...updatedProfile,
            profile_picture_url: profilePictureUrl
          },
          completion_percentage: completionPercentage
        }
      });
    } catch (error) {
      console.error('Error updating current user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Update user profile by ID
  static async updateUserProfile(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const profileData = req.body;
      const updatedProfile = await UserProfile.upsert(userId, profileData);

      // Generate profile picture URL if name fields are provided
      let profilePictureUrl = null;
      if (updatedProfile.first_name || updatedProfile.last_name) {
        profilePictureUrl = ProfileController.generateProfilePictureUrl(
          updatedProfile.first_name,
          updatedProfile.last_name
        );
      }

      // Log activity
      await logActivity(userId, 'profile_update', 'User profile updated', {
        updated_fields: Object.keys(profileData),
        updated_by: req.user.role === 'psychiatrist' ? 'psychiatrist' : 'self'
      });

      const completionPercentage = await UserProfile.getCompletionPercentage(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: {
            ...updatedProfile,
            profile_picture_url: profilePictureUrl
          },
          completion_percentage: completionPercentage
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Generate profile picture URL using UI Avatars
  static generateProfilePictureUrl(firstName, lastName, size = 64) {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (!name) {
      return `https://ui-avatars.com/api/?name=User&size=${size}&background=3B82F6&color=ffffff`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=3B82F6&color=ffffff`;
  }

  // Get profile picture URL
  static async getProfilePicture(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const profile = await UserProfile.findByUserId(user.id);
      const size = parseInt(req.query.size) || 64;
      
      // Validate size (max 128 as per UI Avatars)
      const validSize = Math.min(Math.max(size, 16), 128);
      
      const profilePictureUrl = ProfileController.generateProfilePictureUrl(
        profile?.first_name,
        profile?.last_name,
        validSize
      );

      res.json({
        success: true,
        data: {
          profile_picture_url: profilePictureUrl,
          size: validSize
        }
      });
    } catch (error) {
      console.error('Error getting profile picture:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile picture'
      });
    }
  }

  // Get profile completion status
  static async getProfileCompletion(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const completionPercentage = await UserProfile.getCompletionPercentage(user.id);
      const profile = await UserProfile.findByUserId(user.id);

      // Determine missing required fields
      const requiredFields = [
        'first_name', 'last_name', 'date_of_birth', 'gender', 
        'phone', 'city', 'state', 'country'
      ];

      const missingFields = requiredFields.filter(field => 
        !profile || !profile[field] || profile[field].toString().trim() === ''
      );

      res.json({
        success: true,
        data: {
          completion_percentage: completionPercentage,
          is_complete: completionPercentage === 100,
          missing_fields: missingFields,
          total_required_fields: requiredFields.length,
          completed_fields: requiredFields.length - missingFields.length
        }
      });
    } catch (error) {
      console.error('Error getting profile completion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile completion status'
      });
    }
  }
}

module.exports = ProfileController;