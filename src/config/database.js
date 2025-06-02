const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'mindnest_user',
  password: process.env.DB_PASSWORD || 'mindnest_password',
  database: process.env.DB_NAME || 'mindnest_users',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔌 Database connection established');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table (basic info synced from auth service)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        auth_user_id INTEGER UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // User profiles table (detailed user information)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(20),
        phone VARCHAR(20),
        address_line_1 VARCHAR(255),
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'United States',
        profile_picture_url VARCHAR(500),
        bio TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relationship VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    // User preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'UTC',
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        appointment_reminders BOOLEAN DEFAULT true,
        wellness_tips BOOLEAN DEFAULT true,
        marketing_emails BOOLEAN DEFAULT false,
        data_sharing BOOLEAN DEFAULT false,
        session_recording BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    // Mental health profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mental_health_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        primary_concerns TEXT[],
        therapy_goals TEXT[],
        previous_therapy BOOLEAN DEFAULT false,
        current_medications TEXT[],
        allergies TEXT[],
        medical_conditions TEXT[],
        therapy_preferences JSONB,
        crisis_plan TEXT,
        support_system TEXT,
        stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
        sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    // User activities log
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_description TEXT,
        metadata JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_mental_health_profiles_user_id ON mental_health_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tables = ['users', 'user_profiles', 'user_preferences', 'mental_health_profiles'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database query function
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query error', { text, duration, error });
    throw error;
  }
};

// Get a client from the pool
const getClient = async () => {
  return await pool.connect();
};

// Close all connections
const closePool = async () => {
  await pool.end();
  console.log('🔌 Database connection pool closed');
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  query,
  getClient,
  closePool
};