const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function sign(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, Object.assign({ expiresIn: '7d' }, opts));
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { sign, verify };