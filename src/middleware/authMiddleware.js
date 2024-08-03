const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../services/db'); // Adjust the path as needed
const tokenBlacklist = require('../services/tokenBlocklist');

async function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided.' });
  }

  // Check if the token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ error: 'Forbidden: Token is blacklisted.' });
  }

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        // If the token has expired, try to refresh it using the refresh token
        const refreshToken = req.header('Refresh-Token');

        if (!refreshToken) {
          return res.status(401).json({ error: 'Unauthorized: Token has expired, and no refresh token provided.' });
        }

        try {
          const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

          // Retrieve user from the database
          const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);

          if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
            return res.status(401).json({ error: 'Invalid refresh token.' });
          }

          // Generate a new pair of JWT token and refresh token
          const newToken = jwt.sign({ userId: decoded.userId, username: decoded.username }, config.jwt.accessSecret, { expiresIn: '15m' });
          const newRefreshToken = jwt.sign({ userId: decoded.userId, username: decoded.username }, config.jwt.refreshSecret);

          // Update the user's refresh token in the database
          await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, decoded.userId]);

          // Set the new token in the response headers
          res.setHeader('Authorization', newToken);

          // Continue with the request
          req.user = { userId: decoded.userId, username: decoded.username, role: rows[0].role };
          next();
        } catch (error) {
          console.error('Error refreshing token:', error);
          res.status(401).json({ error: 'Invalid refresh token.' });
        }
      } else {
        return res.status(403).json({ error: 'Forbidden: Invalid token.' });
      }
    } else {
      // Retrieve user role from the database
      try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [user.userId]);
        if (rows.length === 0) {
          return res.status(401).json({ error: 'User not found.' });
        }
        req.user = { ...user, role: rows[0].role };
        next();
      } catch (error) {
        console.error('Failed to retrieve user role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have the required permissions.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
