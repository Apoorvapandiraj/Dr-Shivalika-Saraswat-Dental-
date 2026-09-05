const User = require('../models/User');
const AdminAccess = require('../models/AdminAccess');
const { TokenManager } = require('../middleware/auth');
const { OTPManager } = require('../middleware/otp');
const { AppError, asyncHandler } = require('../middleware/error');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({
    name: String(name).trim().slice(0, 60),
    email: String(email).toLowerCase().trim(),
    phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : undefined,
    password,
    role: 'patient', // role escalation via public registration is never allowed — admins only via seed/invite
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email, deletedAt: null }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = TokenManager.generateAccessToken(user._id, user.role);
  const refreshToken = TokenManager.generateRefreshToken(user._id);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});

// POST /api/auth/refresh — rotates the refresh token (old one is revoked)
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  if (TokenManager.isTokenBlacklisted(refreshToken)) {
    throw new AppError('Refresh token has been revoked', 401);
  }

  const decoded = TokenManager.verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId);
  if (!user || user.deletedAt) throw new AppError('User no longer exists', 401);

  // Rotate: revoke the presented token and issue a fresh pair
  TokenManager.blacklistToken(refreshToken);

  res.json({
    success: true,
    data: {
      accessToken: TokenManager.generateAccessToken(user._id, user.role),
      refreshToken: TokenManager.generateRefreshToken(user._id),
    },
  });
});

// POST /api/auth/logout — revokes both access and refresh tokens
exports.logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    TokenManager.blacklistToken(header.split(' ')[1]);
  }
  if (req.body?.refreshToken) {
    TokenManager.blacklistToken(req.body.refreshToken);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/send-otp  { identifier, channel: 'email'|'sms', purpose }
exports.sendOTP = asyncHandler(async (req, res) => {
  const { identifier, channel = 'email', purpose = 'verification' } = req.body;
  if (!identifier) throw new AppError('Identifier (email or phone) is required', 400);

  const otp = await OTPManager.storeOTP(identifier, purpose);

  if (channel === 'sms') {
    await OTPManager.sendOTPSMS(identifier, otp);
  } else {
    await OTPManager.sendOTPEmail(identifier, otp, purpose);
  }

  res.json({ success: true, message: `OTP sent via ${channel}` });
});

// POST /api/auth/verify-otp  { identifier, purpose, otp }
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { identifier, purpose = 'verification', otp } = req.body;
  if (!identifier || !otp) throw new AppError('Identifier and OTP are required', 400);

  await OTPManager.verifyOTP(identifier, purpose, otp);

  if (purpose === 'verification') {
    await User.updateOne({ email: identifier }, { isEmailVerified: true }).catch(() => {});
  }

  res.json({ success: true, message: 'OTP verified successfully' });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const access = await AdminAccess.findOne({ userId: req.userId });
  res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      adminAccess: access || null,
    },
  });
});
