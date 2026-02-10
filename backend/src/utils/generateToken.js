// src/utils/generateToken.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate JWT token
const getSignedJwtToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'eduverse-dev-secret-123',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate email verification token
const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const tokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return { token, hashedToken, tokenExpire };
};

// Generate password reset token
const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const tokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return { token, hashedToken, tokenExpire };
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedJwtToken(user);
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

module.exports = {
  getSignedJwtToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  sendTokenResponse
};