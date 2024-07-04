// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Create project route
router.post('/', 
  (req, res, next) => {
    console.log('Files:', req.files); // This may contain sensitive information, use with caution
    next(); // Call next() to proceed to the next middleware or route handler
  },
  projectController.upload,
  projectController.validateProject,
  projectController.createProject
);

// Get project route
router.get('/:projectId', projectController.getProject);

// Update project route
router.put('/:projectId', 
  (req, res, next) => {
    console.log('Files:', req.files); // This may contain sensitive information, use with caution
    next(); // Call next() to proceed to the next middleware or route handler
  },
  projectController.upload,
  projectController.validateProject,
  projectController.updateProject
);

// Delete project route
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;
