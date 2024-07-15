// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Send a message (files are optional)
router.post('/send', authenticateToken, messageController.upload, messageController.sendMessage);

// Get messages between two users
router.get('/:userId1/:userId2', authenticateToken, messageController.getMessages);

// Mark message as read
router.patch('/markAsRead/:messageId', authenticateToken, messageController.markMessageAsRead);

module.exports = router;
