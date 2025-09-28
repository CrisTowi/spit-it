const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        error: 'Acceso denegado. Token de autorización requerido.'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido. Use "Bearer <token>".'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido. Usuario no encontrado.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado. Por favor inicia sesión nuevamente.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Error interno del servidor.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    req.user = user && user.isActive ? user : null;
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticate(req, res, () => {
      // Check if user is admin (you can add an isAdmin field to User model)
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      error: 'Error interno del servidor.'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authenticateAdmin,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
