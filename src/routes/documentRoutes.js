// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const  uploadFile  = require('../middleware/uploadFileDocument');


// add document
router.post('/create', authenticateToken, uploadFile,  documentController.createDocument);


module.exports = router;
