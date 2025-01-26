// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db'); // Adjust the path as needed
const config = require('../config/config');
const tokenBlacklist = require('../services/tokenBlocklist');


exports.register = async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error: 'Please provide both username and password.'});
    }

    try {
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0 && existingUsers[0].active) {
            return res.status(400).json({error: 'User already registered and active.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute('INSERT INTO users (username, password, refresh_token, active) VALUES (?, ?, ?, ?)', [username, hashedPassword, null, true]);

        const token = jwt.sign({userId: result.insertId, username}, config.jwt.accessSecret, {expiresIn: '30m'});
        const refreshToken = jwt.sign({userId: result.insertId, username}, config.jwt.refreshSecret);

        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, result.insertId]);

        res.json({token, refreshToken});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


exports.login = async (req, res) => {
    const {username, password} = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({error: 'Please provide both username and password.'});
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({error: 'Invalid credentials.'});
        }

        const user = rows[0];

        if (!user.active) {
            return res.status(401).json({error: 'User is inactive.'});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({error: 'Invalid credentials.'});
        }

        const token = jwt.sign({userId: user.id, username}, config.jwt.accessSecret, {expiresIn: '30m'});
        const refreshToken = jwt.sign({userId: user.id, username}, config.jwt.refreshSecret);

        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        res.json({token, refreshToken});
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


// change 

exports.changePassword = async (req, res) => {
    const {userId, newPassword} = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({error: 'Please provide both userId and new password.'});
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'User not found.'});
        }

        res.status(200).json({message: 'Password updated successfully'});
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


// sign out 

exports.signOut = async (req, res) => {
    const userId = req.user.userId;
    const token = req.header('Authorization');

    try {
        const [result] = await db.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'User not found.'});
        }

        tokenBlacklist.add(token);

        res.status(200).json({message: 'Signed out successfully'});
    } catch (error) {
        console.error('Error signing out:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

// refresh token 
exports.refresh = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({error: 'Refresh token is required.'});
    }

    try {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);

        if (rows.length === 0 || rows[0].refresh_token !== refreshToken || !rows[0].active) {
            return res.status(401).json({error: 'Invalid refresh token or inactive user.'});
        }

        const token = jwt.sign({
            userId: decoded.userId,
            username: decoded.username
        }, config.jwt.accessSecret, {expiresIn: '30m'});
        const newRefreshToken = jwt.sign({
            userId: decoded.userId,
            username: decoded.username
        }, config.jwt.refreshSecret);

        await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, decoded.userId]);

        res.json({token, refreshToken: newRefreshToken});
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(401).json({error: 'Invalid refresh token.'});
    }
};
// update usser role
exports.updateUserRole = async (req, res) => {
    const {userId, role} = req.body;

    if (!userId || !role) {
        return res.status(400).json({error: 'Please provide both userId and role.'});
    }

    const validRoles = ['admin', 'excellent_supervisor', 'site_manager'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({error: 'Invalid role provided.'});
    }

    try {
        const result = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'User not found.'});
        }

        res.status(200).json({message: 'User role updated successfully'});
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


exports.updateUserActiveStatus = async (req, res) => {
    const {userId, active} = req.body;

    if (!userId || typeof active !== 'boolean') {
        return res.status(400).json({error: 'Please provide both userId and active status.'});
    }

    try {
        const [result] = await db.execute('UPDATE users SET active = ? WHERE id = ?', [active, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'User not found.'});
        }

        res.status(200).json({message: 'User active status updated successfully'});
    } catch (error) {
        console.error('Error updating user active status:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

