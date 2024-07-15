// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Refresh token route
router.post('/refresh', authController.refresh);

// Update user role route
router.put('/update-role', authenticateToken ,authorizeRoles('admin'),authController.updateUserRole);

// update user active 
router.put('/active', authenticateToken ,authorizeRoles('admin'),authController.updateUserActiveStatus);



module.exports = router;
