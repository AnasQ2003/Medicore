const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'medicore_secret_key_12345', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'medicore_secret_key_12345');
};

module.exports = {
  generateToken,
  verifyToken
};
