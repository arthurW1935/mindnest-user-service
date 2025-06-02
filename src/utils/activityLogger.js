const { query } = require('../config/database');

// Log user activity
const logActivity = async (userId, activityType, description, metadata = {}, ipAddress = null, userAgent = null) => {
  try {
    await query(
      `INSERT INTO user_activities (user_id, activity_type, activity_description, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, activityType, description, JSON.stringify(metadata), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Get user activities with pagination
const getUserActivities = async (userId, options = {}) => {
  try {
    const {
      limit = 20,
      offset = 0,
      activityType = null,
      startDate = null,
      endDate = null
    } = options;

    let whereClause = 'WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (activityType) {
      whereClause += ` AND activity_type = $${paramCount}`;
      values.push(activityType);
      paramCount++;
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    const result = await query(
      `SELECT id, activity_type, activity_description, metadata, created_at
       FROM user_activities
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM user_activities ${whereClause}`,
      values.slice(0, -2) // Remove limit and offset from count query
    );

    return {
      activities: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } catch (error) {
    console.error('Error getting user activities:', error);
    throw error;
  }
};

// Get activity summary for a user
const getActivitySummary = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await query(
      `SELECT 
         activity_type,
         COUNT(*) as count,
         MAX(created_at) as last_activity
       FROM user_activities
       WHERE user_id = $1 AND created_at >= $2
       GROUP BY activity_type
       ORDER BY count DESC`,
      [userId, startDate.toISOString()]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting activity summary:', error);
    throw error;
  }
};

// Clean old activities (for maintenance)
const cleanOldActivities = async (daysToKeep = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await query(
      `DELETE FROM user_activities WHERE created_at < $1`,
      [cutoffDate.toISOString()]
    );

    console.log(`Cleaned ${result.rowCount} old activity records`);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning old activities:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getUserActivities,
  getActivitySummary,
  cleanOldActivities
};