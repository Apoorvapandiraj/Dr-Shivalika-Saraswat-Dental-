// Test environment setup — must run before the app is required
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret';
process.env.OTP_EXPIRY_MINUTES = '15';
process.env.CORS_ORIGIN = 'http://localhost:3000';
