const { query } = require('../config/database');

class UserPreferences {
  // Create default user preferences
  static async create(userId, preferencesData = {}) {
    try {
      const {
        theme = 'light',
        language = 'en',
        timezone = 'UTC',
        email_notifications = true,
        push_notifications = true,
        sms_notifications = false,
        appointment_reminders = true,
        wellness_tips = true,
        marketing_emails = false,
        data_sharing = false,
        session_recording = false
      } = preferencesData;

      const result = await query(
        `INSERT INTO user_preferences (
          user_id, theme, language, timezone, email_notifications,
          push_notifications, sms_notifications, appointment_reminders,
          wellness_tips, marketing_emails, data_sharing, session_recording
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          userId, theme, language, timezone, email_notifications,
          push_notifications, sms_notifications, appointment_reminders,
          wellness_tips, marketing_emails, data_sharing, session_recording
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user preferences:', error);
      throw error;
    }
  }

  // Get user preferences by user ID
  static async findByUserId(userId) {
    try {
      const result = await query(
        `SELECT * FROM user_preferences WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user preferences:', error);
      throw error;
    }
  }

  // Update user preferences
  static async update(userId, preferencesData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.entries(preferencesData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(userId);
      const result = await query(
        `UPDATE user_preferences SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount} 
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Create or update user preferences (upsert)
  static async upsert(userId, preferencesData) {
    try {
      const existing = await this.findByUserId(userId);
      
      if (existing) {
        return await this.update(userId, preferencesData);
      } else {
        return await this.create(userId, preferencesData);
      }
    } catch (error) {
      console.error('Error upserting user preferences:', error);
      throw error;
    }
  }

  // Get notification preferences only
  static async getNotificationPreferences(userId) {
    try {
      const result = await query(
        `SELECT email_notifications, push_notifications, sms_notifications,
                appointment_reminders, wellness_tips, marketing_emails
         FROM user_preferences WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences only
  static async updateNotificationPreferences(userId, notificationData) {
    try {
      const allowedFields = [
        'email_notifications', 'push_notifications', 'sms_notifications',
        'appointment_reminders', 'wellness_tips', 'marketing_emails'
      ];

      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.entries(notificationData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid notification fields to update');
      }

      values.push(userId);
      const result = await query(
        `UPDATE user_preferences SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount} 
         RETURNING email_notifications, push_notifications, sms_notifications,
                   appointment_reminders, wellness_tips, marketing_emails`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get privacy preferences only
  static async getPrivacyPreferences(userId) {
    try {
      const result = await query(
        `SELECT data_sharing, session_recording
         FROM user_preferences WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting privacy preferences:', error);
      throw error;
    }
  }

  // Update privacy preferences only
  static async updatePrivacyPreferences(userId, privacyData) {
    try {
      const allowedFields = ['data_sharing', 'session_recording'];

      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.entries(privacyData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid privacy fields to update');
      }

      values.push(userId);
      const result = await query(
        `UPDATE user_preferences SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount} 
         RETURNING data_sharing, session_recording`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      throw error;
    }
  }

  // Delete user preferences
  static async delete(userId) {
    try {
      const result = await query(
        `DELETE FROM user_preferences WHERE user_id = $1 RETURNING *`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }

  // Reset preferences to default
  static async resetToDefault(userId) {
    try {
      const result = await query(
        `UPDATE user_preferences SET 
          theme = 'light',
          language = 'en',
          timezone = 'UTC',
          email_notifications = true,
          push_notifications = true,
          sms_notifications = false,
          appointment_reminders = true,
          wellness_tips = true,
          marketing_emails = false,
          data_sharing = false,
          session_recording = false
         WHERE user_id = $1 
         RETURNING *`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error resetting preferences to default:', error);
      throw error;
    }
  }
}

module.exports = UserPreferences;