const { query } = require('../config/database');

class UserProfile {
  // Create user profile
  static async create(userId, profileData) {
    try {
      const {
        first_name, last_name, date_of_birth, gender, phone,
        address_line_1, address_line_2, city, state, postal_code, country,
        profile_picture_url, bio, emergency_contact_name, 
        emergency_contact_phone, emergency_contact_relationship
      } = profileData;

      const result = await query(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, date_of_birth, gender, phone,
          address_line_1, address_line_2, city, state, postal_code, country,
          profile_picture_url, bio, emergency_contact_name, 
          emergency_contact_phone, emergency_contact_relationship
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          userId, first_name, last_name, date_of_birth, gender, phone,
          address_line_1, address_line_2, city, state, postal_code, country,
          profile_picture_url, bio, emergency_contact_name,
          emergency_contact_phone, emergency_contact_relationship
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile by user ID
  static async findByUserId(userId) {
    try {
      const result = await query(
        `SELECT * FROM user_profiles WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async update(userId, profileData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.entries(profileData).forEach(([key, value]) => {
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
        `UPDATE user_profiles SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount} 
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Create or update user profile (upsert)
  static async upsert(userId, profileData) {
    try {
      const existing = await this.findByUserId(userId);
      
      if (existing) {
        return await this.update(userId, profileData);
      } else {
        return await this.create(userId, profileData);
      }
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  // Delete user profile
  static async delete(userId) {
    try {
      const result = await query(
        `DELETE FROM user_profiles WHERE user_id = $1 RETURNING *`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }

  // Update profile picture
  static async updateProfilePicture(userId, pictureUrl) {
    try {
      const result = await query(
        `UPDATE user_profiles SET profile_picture_url = $1 
         WHERE user_id = $2 
         RETURNING profile_picture_url`,
        [pictureUrl, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  // Get profile completion percentage
  static async getCompletionPercentage(userId) {
    try {
      const profile = await this.findByUserId(userId);
      
      if (!profile) {
        return 0;
      }

      const requiredFields = [
        'first_name', 'last_name', 'date_of_birth', 'gender', 
        'phone', 'city', 'state', 'country'
      ];

      const completedFields = requiredFields.filter(field => 
        profile[field] && profile[field].toString().trim() !== ''
      );

      return Math.round((completedFields.length / requiredFields.length) * 100);
    } catch (error) {
      console.error('Error calculating profile completion:', error);
      throw error;
    }
  }
}

module.exports = UserProfile;