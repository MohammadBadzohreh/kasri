const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const db = require('../services/db'); // Adjust the path as needed
const fs = require('fs');

// Configure storage for Multer
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


router.post('/',
  (req, res, next) => {
    console.log('Files:', req.files); // This may contain sensitive information, use with caution
    next(); // Call next() to proceed to the next middleware or route handler
  },
  upload.fields([
    { name: 'address_of_the_first_file', maxCount: 1 },
    { name: 'address_of_the_second_file', maxCount: 1 }
  ]),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('size_square_meters').isNumeric().withMessage('Size in square meters must be a number'),
    body('contractor').notEmpty().withMessage('Contractor is required'),
    body('start_date').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid date'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, size_square_meters, contractor, start_date, end_date } = req.body;
    const address_of_the_first_file = req.files['address_of_the_first_file'] ? req.files['address_of_the_first_file'][0].path : '';
    const address_of_the_second_file = req.files['address_of_the_second_file'] ? req.files['address_of_the_second_file'][0].path : '';




    console.log(name, size_square_meters, contractor, address_of_the_first_file, address_of_the_second_file, start_date, end_date)
    console.log(req.files['address_of_the_first_file'])

    try {
      const result = await db.query(
        'INSERT INTO projects (name, size_square_meters, contractor, address_of_the_first_file, address_of_the_second_file, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, size_square_meters, contractor, address_of_the_first_file, address_of_the_second_file, start_date, end_date]
      );
      
      res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    } catch (error) {
      console.error('Failed to create project:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);



router.get('/:projectId',
  async (req, res) => {
    const projectId = req.params.projectId;

    try {
      // Retrieve the project from the database
      const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json({ project });
    } catch (error) {
      console.error('Failed to retrieve project:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);



router.delete('/:projectId',
  async (req, res) => {
    const projectId = req.params.projectId;

    try {
      // Check if the project exists before deleting it
      const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Log project details to the console
      console.log('Project details:', project);
      console.log(project[0].address_of_the_first_file);

      // Delete the project's associated files from the filesystem
      if (project[0].address_of_the_first_file) {
        fs.unlinkSync(project[0].address_of_the_first_file);
      }
      if (project[0].address_of_the_second_file) {
        fs.unlinkSync(project[0].address_of_the_second_file);
      }

      // Delete the project from the database
      await db.query('DELETE FROM projects WHERE id = ?', [projectId]);

      res.status(200).json({ message: 'Project and associated files deleted successfully' });
    } catch (error) {
      console.error('Failed to delete project:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// todo implement put method

module.exports = router;
