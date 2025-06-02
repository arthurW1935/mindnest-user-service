const jwt = require('jsonwebtoken');

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Add user data to request
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else {
      console.error('Token verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// User-only access
const requireUser = requireRole(['user']);

// Psychiatrist-only access
const requirePsychiatrist = requireRole(['psychiatrist']);

// Any authenticated user
const requireAuth = requireRole(['user', 'psychiatrist']);

// Self-access only (user can only access their own data)
const requireSelfAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const requestedUserId = parseInt(req.params.userId || req.params.id || '');
    const authenticatedUserId = req.user.sub;

    // Allow psychiatrists to access any user data (for therapy sessions)
    if (req.user.role === 'psychiatrist') {
      return next();
    }

    // Users can only access their own data
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own data'
      });
    }

    next();
  } catch (error) {
    console.error('Self-access verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Admin-only access
const requireAdmin = requireRole(['admin']);

module.exports = {
  verifyToken,
  requireRole,
  requireUser,
  requirePsychiatrist,
  requireAuth,
  requireSelfAccess,
  requireAdmin
};