const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// User profile validation schemas
const userProfileSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).trim(),
  last_name: Joi.string().min(1).max(100).trim(),
  date_of_birth: Joi.date().max('now').iso(),
  gender: Joi.string().valid('male', 'female', 'non-binary', 'prefer-not-to-say', 'other'),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).min(10).max(20),
  address_line_1: Joi.string().max(255).trim(),
  address_line_2: Joi.string().max(255).trim().allow(''),
  city: Joi.string().max(100).trim(),
  state: Joi.string().max(100).trim(),
  postal_code: Joi.string().max(20).trim(),
  country: Joi.string().max(100).trim(),
  bio: Joi.string().max(1000).trim().allow(''),
  emergency_contact_name: Joi.string().max(100).trim(),
  emergency_contact_phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).min(10).max(20),
  emergency_contact_relationship: Joi.string().max(50).trim()
});

// User preferences validation schema
const userPreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system'),
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'),
  timezone: Joi.string().max(50),
  email_notifications: Joi.boolean(),
  push_notifications: Joi.boolean(),
  sms_notifications: Joi.boolean(),
  appointment_reminders: Joi.boolean(),
  wellness_tips: Joi.boolean(),
  marketing_emails: Joi.boolean(),
  data_sharing: Joi.boolean(),
  session_recording: Joi.boolean()
});

// Mental health profile validation schema
const mentalHealthProfileSchema = Joi.object({
  primary_concerns: Joi.array().items(
    Joi.string().valid(
      'anxiety',
      'depression',
      'stress',
      'trauma',
      'relationships',
      'work-life-balance',
      'grief',
      'addiction',
      'eating-disorders',
      'sleep-issues',
      'anger-management',
      'self-esteem',
      'other'
    )
  ).max(10),
  therapy_goals: Joi.array().items(Joi.string().max(200)).max(10),
  previous_therapy: Joi.boolean(),
  current_medications: Joi.array().items(Joi.string().max(100)).max(20),
  allergies: Joi.array().items(Joi.string().max(100)).max(20),
  medical_conditions: Joi.array().items(Joi.string().max(100)).max(20),
  therapy_preferences: Joi.object({
    session_type: Joi.string().valid('individual', 'group', 'couples', 'family'),
    communication_style: Joi.string().valid('direct', 'gentle', 'collaborative'),
    session_frequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly', 'as-needed'),
    session_duration: Joi.number().valid(30, 45, 60, 90),
    preferred_time: Joi.string().valid('morning', 'afternoon', 'evening'),
    therapist_gender_preference: Joi.string().valid('male', 'female', 'no-preference'),
    cultural_considerations: Joi.string().max(500)
  }),
  crisis_plan: Joi.string().max(1000),
  support_system: Joi.string().max(500),
  stress_level: Joi.number().min(1).max(10),
  sleep_quality: Joi.number().min(1).max(10)
});

// User creation from auth service schema
const createUserSchema = Joi.object({
  auth_user_id: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('user', 'psychiatrist').required()
});

// Activity log schema
const activityLogSchema = Joi.object({
  activity_type: Joi.string().valid(
    'profile_update',
    'preferences_update',
    'mental_health_profile_update',
    'login',
    'logout',
    'password_change',
    'data_export',
    'data_deletion'
  ).required(),
  activity_description: Joi.string().max(500),
  metadata: Joi.object()
});

module.exports = {
  validate,
  userProfileSchema,
  userPreferencesSchema,
  mentalHealthProfileSchema,
  createUserSchema,
  activityLogSchema
};