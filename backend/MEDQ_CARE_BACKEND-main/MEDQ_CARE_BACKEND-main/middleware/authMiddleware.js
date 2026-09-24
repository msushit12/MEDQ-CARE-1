const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { store } = require('../models/dataStore');
const { JWT_SECRET } = require('../config/jwt');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Fallback if ID format differs
      }
    }

    if (!user) {
      user = store.users.find((u) => u._id.toString() === decoded.id.toString());
      if (user) {
        // Do not return password hash
        const { password, ...userWithoutPass } = user;
        user = userWithoutPass;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated or suspended. Please contact Admin.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token failed or expired.',
      error: error.message,
    });
  }
};

module.exports = { protect };
