// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db'); // Adjust the path as needed
const config = require('../config/config');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide both username and password.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user and refresh token to the database
        const [result] = await db.execute('INSERT INTO users (username, password, refresh_token) VALUES (?, ?, ?)', [username, hashedPassword, null]);

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

        if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
            return res.status(401).json({ error: 'Invalid refresh token.' });
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
