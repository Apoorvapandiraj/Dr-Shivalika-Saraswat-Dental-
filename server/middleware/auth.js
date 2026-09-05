const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const AdminAccess = require('../models/AdminAccess');
const Otp = require('../models/Otp');
const { AppError, asyncHandler } = require('./error');

// ================================================
// 1. JWT TOKEN MANAGEMENT
// ================================================

class TokenManager {
  static get accessSecret() {
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
      console.warn('⚠️  JWT_SECRET not set — using insecure dev fallback. Add it to server/.env');
      return 'dev_only_fallback_jwt_secret';
    }
    return process.env.JWT_SECRET;
  }

  static get refreshSecret() {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      if (process.env.NODE_ENV === 'production') throw new Error('REFRESH_TOKEN_SECRET is required in production');
      return 'dev_only_fallback_refresh_secret';
    }
    return process.env.REFRESH_TOKEN_SECRET;
  }

  static generateAccessToken(userId, role) {
    return jwt.sign({ userId, role }, TokenManager.accessSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  }

  static generateRefreshToken(userId) {
    // Include a random jti so every refresh token is unique — makes rotation meaningful
    // (otherwise JWTs with identical payload+expiry are byte-for-byte identical)
    return jwt.sign({ userId, jti: crypto.randomUUID() }, TokenManager.refreshSecret, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    });
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, TokenManager.accessSecret);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, TokenManager.refreshSecret);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  // In-memory blacklist for logout (swap for Redis in production)
  static tokenBlacklist = new Set();

  static blacklistToken(token) {
    this.tokenBlacklist.add(token);
  }

  static isTokenBlacklisted(token) {
    return this.tokenBlacklist.has(token);
  }
}

// ================================================
// 2. AUTHENTICATION MIDDLEWARE
// ================================================

const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.split(' ')[1];
  if (TokenManager.isTokenBlacklisted(token)) {
    throw new AppError('Token has been revoked', 401);
  }

  const decoded = TokenManager.verifyAccessToken(token);
  const user = await User.findById(decoded.userId);
  if (!user || user.deletedAt) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  req.userId = user._id;
  next();
});

// ================================================
// 3. ROLE-BASED ACCESS CONTROL
// ================================================

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const checkPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));

    if (req.user.role === 'admin') {
      const access = await AdminAccess.findOne({ userId: req.userId, status: 'active' });
      if (access && (access.role === 'super_admin' || access.permissions.includes(permission))) {
        return next();
      }
    }
    return next(new AppError(`Missing permission: ${permission}`, 403));
  });
};

module.exports = { TokenManager, authMiddleware, authorizeRoles, checkPermission };
