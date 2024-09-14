// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const excelController = require('../controllers/excelController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');


// Create project route
router.post('/', 
  authorizeRoles('admin'), // Only admins can create projects
  (req, res, next) => {
    console.log('Files:', req.files); // This may contain sensitive information, use with caution
    next(); // Call next() to proceed to the next middleware or route handler
  },
  projectController.upload,
  projectController.validateProject,
  projectController.createProject
);

// Get project route
router.get('/:projectId', 
  authorizeRoles('admin', 'excellent_supervisor', 'site_manager'), // Admin, Excellent supervisors, and site managers can view projects
  projectController.getProject
);

// Update project route
router.put('/:projectId', 
  // authorizeRoles('admin', 'site_manager'), // Admin and site managers can update projects
  (req, res, next) => {
    console.log('Files:', req.files); // This may contain sensitive information, use with caution
    next(); // Call next() to proceed to the next middleware or route handler
  },
  projectController.upload,
  projectController.validateProject,
  projectController.updateProject
);

// Delete project route
router.delete('/:projectId', 
  authorizeRoles('admin'), // Only admins can delete projects
  projectController.deleteProject
);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/uploaddd/:project_id', upload.single('file'), excelController.uploadProjectFile);

module.exports = router;
