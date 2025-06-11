# MindNest User Service

A comprehensive microservice for managing user profiles, preferences, and mental health data on the MindNest platform. This service handles user profile management, preferences, activity tracking, and GDPR compliance features.

## 🚀 Features

- **User Profile Management**: Complete user profile with personal and contact information
- **Preferences System**: Customizable user preferences for notifications, privacy, and UI
- **Mental Health Profiles**: Specialized mental health data and therapy preferences
- **Activity Tracking**: Comprehensive user activity logging and monitoring
- **GDPR Compliance**: Data export and privacy controls
- **Role-Based Access**: Secure access control for different user types
- **Profile Completion**: Track and encourage profile completion
- **Emergency Contacts**: Emergency contact information management
- **Security**: JWT-based authentication with role-based access control
- **PostgreSQL Integration**: Robust relational database with optimized queries

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- MindNest Auth Service running (for JWT verification)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindnest-user-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3002
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mindnest_users
   DB_USER=mindnest_user
   DB_PASSWORD=mindnest_password

   # JWT Configuration (must match Auth Service)
   JWT_SECRET=your_super_secret_jwt_key_here

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,https://mindnest-frontend.vercel.app

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Optional: Production Database URL
   # DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Database Setup**
   - Create a PostgreSQL database named `mindnest_users`
   - The service will automatically create all required tables on startup

5. **Start the service**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 🏗️ Architecture

```
mindnest-user-service/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection and table initialization
│   ├── controllers/
│   │   ├── userController.js     # User management logic
│   │   ├── profileController.js  # Profile management logic
│   │   └── preferencesController.js # Preferences management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification and role-based access
│   │   ├── validation.js         # Request validation schemas
│   │   └── errorHandler.js       # Global error handling
│   ├── models/
│   │   ├── User.js               # User data model
│   │   ├── UserProfile.js        # Profile data model
│   │   └── UserPreferences.js    # Preferences data model
│   ├── routes/
│   │   ├── userRoutes.js         # User API routes
│   │   ├── profileRoutes.js      # Profile API routes
│   │   └── preferencesRoutes.js  # Preferences API routes
│   ├── utils/
│   │   └── activityLogger.js     # Activity logging utilities
│   └── server.js                 # Express server setup
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check

#### `GET /health`
Check service health status.

**Response:**
```json
{
  "success": true,
  "message": "User Service is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "user-service",
  "version": "1.0.0"
}
```

### User Management

#### `POST /api/users/create`
Create a new user (called by Auth Service).

**Request Body:**
```json
{
  "auth_user_id": 123,
  "email": "user@mindnest.com",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "auth_user_id": 123,
      "email": "user@mindnest.com",
      "role": "user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### `GET /api/users/me`
Get current user information (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "auth_user_id": 123,
      "email": "user@mindnest.com",
      "role": "user",
      "is_active": true,
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture_url": "https://example.com/avatar.jpg",
      "theme": "light",
      "language": "en",
      "timezone": "America/New_York",
      "profile_completion": 75,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### `GET /api/users/:id`
Get user by ID (self-access or psychiatrist).

#### `GET /api/users/auth/:id`
Get user by auth user ID (self-access or psychiatrist).

#### `PUT /api/users/me`
Update current user basic information.

#### `DELETE /api/users/me`
Delete current user account (soft delete).

#### `GET /api/users/:id/activities`
Get user activity log (self-access or psychiatrist).

#### `GET /api/users/me/export`
Export user data (GDPR compliance).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@mindnest.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-01",
      "phone": "+1-555-0123"
    },
    "preferences": {
      "theme": "light",
      "language": "en",
      "email_notifications": true
    },
    "activities": [
      {
        "activity_type": "profile_updated",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Profile Management

#### `GET /api/profile/me`
Get current user's profile (requires authentication).

#### `PUT /api/profile/me`
Update current user's profile.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "phone": "+1-555-0123",
  "address_line_1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "bio": "Mental health advocate seeking therapy for anxiety.",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1-555-0124",
  "emergency_contact_relationship": "Spouse"
}
```

#### `GET /api/profile/:userId`
Get user profile by ID (self-access or psychiatrist).

#### `PUT /api/profile/:userId`
Update user profile by ID (self-access or psychiatrist).

#### `GET /api/profile/me/completion`
Get profile completion percentage.

**Response:**
```json
{
  "success": true,
  "data": {
    "completion_percentage": 75,
    "missing_fields": ["date_of_birth", "emergency_contact"],
    "total_fields": 12,
    "completed_fields": 9
  }
}
```

### Preferences Management

#### `GET /api/preferences/me`
Get current user's preferences (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "theme": "light",
      "language": "en",
      "timezone": "America/New_York",
      "email_notifications": true,
      "push_notifications": true,
      "sms_notifications": false,
      "appointment_reminders": true,
      "wellness_tips": true,
      "marketing_emails": false,
      "data_sharing": false,
      "session_recording": false
    }
  }
}
```

#### `PUT /api/preferences/me`
Update current user's preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "language": "es",
  "timezone": "America/Los_Angeles",
  "email_notifications": true,
  "push_notifications": false,
  "appointment_reminders": true,
  "wellness_tips": false,
  "marketing_emails": false,
  "data_sharing": true,
  "session_recording": false
}
```

#### `GET /api/preferences/me/notifications`
Get notification preferences only.

#### `PUT /api/preferences/me/notifications`
Update notification preferences only.

#### `GET /api/preferences/me/privacy`
Get privacy preferences only.

#### `PUT /api/preferences/me/privacy`
Update privacy preferences only.

#### `POST /api/preferences/me/reset`
Reset preferences to default values.

### Mental Health Profile

#### `GET /api/profile/me/mental-health`
Get mental health profile (requires authentication).

#### `PUT /api/profile/me/mental-health`
Update mental health profile.

**Request Body:**
```json
{
  "primary_concerns": ["Anxiety", "Depression"],
  "therapy_goals": ["Reduce anxiety symptoms", "Improve mood"],
  "previous_therapy": true,
  "current_medications": ["Sertraline"],
  "allergies": ["None"],
  "medical_conditions": ["None"],
  "therapy_preferences": {
    "session_type": "individual",
    "frequency": "weekly",
    "duration": "60_minutes"
  },
  "crisis_plan": "Contact emergency services if needed",
  "support_system": "Family and close friends",
  "stress_level": 7,
  "sleep_quality": 5
}
```

## 🔒 Data Models

### User Model
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_user_id INTEGER UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Profile Model
```sql
CREATE TABLE user_profiles (
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
);
```

### User Preferences Model
```sql
CREATE TABLE user_preferences (
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
);
```

### Mental Health Profile Model
```sql
CREATE TABLE mental_health_profiles (
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
);
```

## 🔐 Authentication & Authorization

### JWT Token Verification
- All protected endpoints require valid JWT tokens
- Tokens are verified against the Auth Service secret
- Automatic token expiration handling

### Role-Based Access Control
- **Public Routes**: User creation (called by Auth Service)
- **User Routes**: Profile management, preferences, data export
- **Psychiatrist Routes**: Access to user data for therapy sessions
- **Admin Routes**: User management and statistics

### Access Control Levels
- `requireAuth`: Any authenticated user
- `requireUser`: User role only
- `requirePsychiatrist`: Psychiatrist role only
- `requireSelfAccess`: User can access own data, psychiatrist can access any user
- `requireAdmin`: Admin role only

## 🔧 Validation Rules

### Profile Validation
- **Names**: 1-100 characters
- **Phone**: Valid phone format
- **Date of Birth**: Valid date, minimum age 13
- **Gender**: Valid gender options
- **Bio**: Maximum 1000 characters

### Preferences Validation
- **Theme**: light, dark, auto
- **Language**: Valid language codes (en, es, fr, etc.)
- **Timezone**: Valid timezone identifier
- **Boolean Preferences**: true/false values

### Mental Health Profile Validation
- **Stress Level**: 1-10 scale
- **Sleep Quality**: 1-10 scale
- **Arrays**: Maximum 10 items per array
- **JSON Preferences**: Valid JSON structure

## 🚀 Key Features

### Profile Completion Tracking
- Automatic calculation of profile completion percentage
- Identification of missing required fields
- Encouragement for profile completion

### Activity Logging
- Comprehensive user activity tracking
- IP address and user agent logging
- Activity metadata storage
- Audit trail for compliance

### GDPR Compliance
- Complete data export functionality
- Privacy preference controls
- Data sharing controls
- Right to be forgotten support

### Emergency Contact Management
- Emergency contact information storage
- Relationship tracking
- Quick access for crisis situations

### Mental Health Profile
- Specialized mental health data collection
- Therapy preferences and goals
- Medical history tracking
- Crisis plan management

## 📊 Monitoring & Maintenance

### Health Monitoring
- Built-in health check endpoint
- Database connection monitoring
- Service status reporting

### Activity Tracking
- User activity logging
- Performance monitoring
- Error tracking

### Error Handling
- Comprehensive error logging
- Graceful error responses
- Request validation
- Database error handling



## 🔄 Version History

- **v1.0.0**: Initial release with core user features
  - User profile management
  - Preferences system
  - Mental health profiles
  - Activity tracking
  - GDPR compliance features
  - Role-based access control
  - PostgreSQL integration
  - JWT authentication
  - Profile completion tracking 