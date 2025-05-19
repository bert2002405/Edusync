
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  // For development, allow all requests
  if (process.env.NODE_ENV !== 'production') {
    req.user = { id: 'development_user' };
    return next();
  }

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Allow requests without valid token in development
      req.user = { id: 'development_user' };
      return next();
    }
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

module.exports = auth;
