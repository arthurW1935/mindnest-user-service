const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserPreferences = require('../models/UserPreferences');
const { logActivity } = require('../utils/activityLogger');

class UserController {
  // Create new user (called by auth service)
  static async createUser(req, res) {
    try {
      const { auth_user_id, email, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByAuthUserId(auth_user_id);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Create user
      const user = await User.create({ auth_user_id, email, role });

      // Create default preferences
      await UserPreferences.create(user.id);

      // Log activity
      await logActivity(user.id, 'user_created', 'User account created', {
        email,
        role
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            auth_user_id: user.auth_user_id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get profile completion percentage
      const completionPercentage = await UserProfile.getCompletionPercentage(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            auth_user_id: user.auth_user_id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_picture_url: user.profile_picture_url,
            theme: user.theme,
            language: user.language,
            timezone: user.timezone,
            profile_completion: completionPercentage,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get profile completion percentage
      const completionPercentage = await UserProfile.getCompletionPercentage(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            auth_user_id: user.auth_user_id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_picture_url: user.profile_picture_url,
            theme: user.theme,
            language: user.language,
            timezone: user.timezone,
            profile_completion: completionPercentage,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  // Update current user basic info
  static async updateCurrentUser(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { email } = req.body;
      const updateData = {};

      if (email && email !== user.email) {
        updateData.email = email;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const updatedUser = await User.update(user.id, updateData);

      // Log activity
      await logActivity(user.id, 'user_updated', 'Basic user information updated', {
        updated_fields: Object.keys(updateData)
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            auth_user_id: updatedUser.auth_user_id,
            email: updatedUser.email,
            role: updatedUser.role,
            is_active: updatedUser.is_active,
            updated_at: updatedUser.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete current user account (soft delete)
  static async deleteCurrentUser(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await User.delete(user.id);

      // Log activity
      await logActivity(user.id, 'user_deleted', 'User account deactivated', {
        deactivated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'User account deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user account'
      });
    }
  }

  // Get all users (psychiatrist only)
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const role = req.query.role || '';

      const filters = {
        limit,
        offset,
        ...(search && { search }),
        ...(role && { role })
      };

      const users = await User.findAll(filters);
      const total = await User.getCount(filters);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  // Get user activities
  static async getUserActivities(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Implementation would be in ActivityLogger utility
      // For now, return placeholder
      res.json({
        success: true,
        data: {
          activities: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting user activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user activities'
      });
    }
  }

  // Export user data (GDPR compliance)
  static async exportUserData(req, res) {
    try {
      const authUserId = req.user.sub;
      const user = await User.findByAuthUserId(authUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get all user data
      const profile = await UserProfile.findByUserId(user.id);
      const preferences = await UserPreferences.findByUserId(user.id);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        profile: profile || {},
        preferences: preferences || {},
        exported_at: new Date().toISOString()
      };

      // Log activity
      await logActivity(user.id, 'data_export', 'User data exported', {
        export_date: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'User data exported successfully',
        data: exportData
      });
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export user data'
      });
    }
  }

  // Search users (psychiatrist only)
  static async searchUsers(req, res) {
    try {
      const query = req.params.query;
      const filters = {
        search: query,
        limit: 20
      };

      const users = await User.findAll(filters);

      res.json({
        success: true,
        data: {
          users,
          query
        }
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  }

  // Get total user count for admin
  static async getUserCount(req, res) {
    try {
      const count = await User.getTotalCount();
      
      res.json({
        success: true,
        data: {
          count
        }
      });
    } catch (error) {
      console.error('Error getting user count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user count'
      });
    }
  }
}

module.exports = UserController;