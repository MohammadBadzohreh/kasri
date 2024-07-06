// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Send message route
router.post('/send', messageController.upload, messageController.sendMessage);

// Get messages between two users
router.get('/:userId1/:userId2', messageController.getMessages);

// Mark message as read
router.put('/read/:messageId', messageController.markMessageAsRead);

module.exports = router;
