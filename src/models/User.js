const { query } = require('../config/database');

class User {
  // Create a new user (called from auth service)
  static async create(userData) {
    try {
      const { auth_user_id, email, role } = userData;
      
      const result = await query(
        `INSERT INTO users (auth_user_id, email, role) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [auth_user_id, email, role]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT u.*, 
                up.first_name, up.last_name, up.date_of_birth, up.gender, 
                up.phone, up.profile_picture_url, up.bio,
                upr.theme, upr.language, upr.timezone
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN user_preferences upr ON u.id = upr.user_id
         WHERE u.id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Get user by auth_user_id
  static async findByAuthUserId(authUserId) {
    try {
      const result = await query(
        `SELECT u.*, 
                up.first_name, up.last_name, up.date_of_birth, up.gender, 
                up.phone, up.profile_picture_url, up.bio,
                upr.theme, upr.language, upr.timezone
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN user_preferences upr ON u.id = upr.user_id
         WHERE u.auth_user_id = $1`,
        [authUserId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by auth user ID:', error);
      throw error;
    }
  }

  // Get user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        `SELECT u.*, 
                up.first_name, up.last_name, up.date_of_birth, up.gender, 
                up.phone, up.profile_picture_url, up.bio,
                upr.theme, upr.language, upr.timezone
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN user_preferences upr ON u.id = upr.user_id
         WHERE u.email = $1`,
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Update user basic info
  static async update(id, userData) {
    try {
      const { email, role, is_active } = userData;
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (role !== undefined) {
        fields.push(`role = $${paramCount++}`);
        values.push(role);
      }
      if (is_active !== undefined) {
        fields.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (soft delete by setting is_active to false)
  static async delete(id) {
    try {
      const result = await query(
        `UPDATE users SET is_active = false WHERE id = $1 RETURNING *`,
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users (for admin/psychiatrist use)
  static async findAll(filters = {}) {
    try {
      let whereClause = 'WHERE u.is_active = true';
      const values = [];
      let paramCount = 1;

      if (filters.role) {
        whereClause += ` AND u.role = ${paramCount++}`;
        values.push(filters.role);
      }

      if (filters.search) {
        whereClause += ` AND (u.email ILIKE ${paramCount} OR up.first_name ILIKE ${paramCount} OR up.last_name ILIKE ${paramCount++})`;
        values.push(`%${filters.search}%`);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const result = await query(
        `SELECT u.id, u.auth_user_id, u.email, u.role, u.is_active, u.created_at,
                up.first_name, up.last_name, up.profile_picture_url
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT ${paramCount++} OFFSET ${paramCount}`,
        [...values, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // Get total user count
  static async getTotalCount() {
    try {
      const result = await query(
        `SELECT COUNT(*) as total FROM users WHERE is_active = true`
      );
      
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total user count:', error);
      throw error;
    }
  }
}

module.exports = User;