// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db'); // Adjust the path as needed
const config = require('../config/config');
const tokenBlacklist = require('../services/tokenBlocklist');


exports.register = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide both username and password.' });
    }

    try {
        // Check if the user is already registered and active
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0 && existingUsers[0].active) {
            return res.status(400).json({ error: 'User already registered and active.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user and refresh token to the database
        const [result] = await db.execute('INSERT INTO users (username, password, refresh_token, active) VALUES (?, ?, ?, ?)', [username, hashedPassword, null, true]);

        // Generate a JWT token and refresh token
        const token = jwt.sign({ userId: result.insertId, username }, config.jwt.accessSecret, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ userId: result.insertId, username }, config.jwt.refreshSecret);

        // Update the user's refresh token in the database
        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, result.insertId]);

        // Respond with the token and refresh token
        res.json({ token, refreshToken });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


 
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide both username and password.' });
    }

    try {
        // Retrieve user from the database
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];

        // Check if the user is active
        if (!user.active) {
            return res.status(401).json({ error: 'User is inactive.' });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate a new pair of JWT token and refresh token
        const token = jwt.sign({ userId: user.id, username }, config.jwt.accessSecret, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ userId: user.id, username }, config.jwt.refreshSecret);

        // Update the user's refresh token in the database
        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        // Respond with the token and refresh token
        res.json({ token, refreshToken });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// change password 

exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    // Validate input
    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'Please provide both userId and new password.' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// sign out 

exports.signOut = async (req, res) => {
    const userId = req.user.userId;
    const token = req.header('Authorization');

    try {
        // Invalidate the refresh token in the database
        const [result] = await db.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Blacklist the access token
        tokenBlacklist.add(token);

        res.status(200).json({ message: 'Signed out successfully' });
    } catch (error) {
        console.error('Error signing out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.refresh = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    // Validate input
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required.' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        // Retrieve user from the database
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);

        if (rows.length === 0 || rows[0].refresh_token !== refreshToken || !rows[0].active) {
            return res.status(401).json({ error: 'Invalid refresh token or inactive user.' });
        }

        // Generate a new pair of JWT token and refresh token
        const token = jwt.sign({ userId: decoded.userId, username: decoded.username }, config.jwt.accessSecret, { expiresIn: '30m' });
        const newRefreshToken = jwt.sign({ userId: decoded.userId, username: decoded.username }, config.jwt.refreshSecret);

        // Update the user's refresh token in the database
        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, decoded.userId]);

        // Respond with the new token and refresh token
        res.json({ token, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(401).json({ error: 'Invalid refresh token.' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { userId, role } = req.body;

    // Validate input
    if (!userId || !role) {
        return res.status(400).json({ error: 'Please provide both userId and role.' });
    }

    // Ensure the role is valid
    const validRoles = ['admin', 'excellent_supervisor', 'site_manager'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role provided.' });
    }

    try {
        // Update the user's role in the database
        const result = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateUserActiveStatus = async (req, res) => {
    const { userId, active } = req.body;

    // Validate input
    if (!userId || typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Please provide both userId and active status.' });
    }

    try {
        // Update the user's active status in the database
        const [result] = await db.execute('UPDATE users SET active = ? WHERE id = ?', [active, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User active status updated successfully' });
    } catch (error) {
        console.error('Error updating user active status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

