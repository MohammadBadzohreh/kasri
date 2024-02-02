const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../services/db'); // Adjust the path as needed

// Create a new project
router.post('/',
  // Validation rules
  [
    body('name').trim().notEmpty().withMessage('Project name is required.'),
    body('size_square_meters').isInt({ gt: 0 }).withMessage('Size in square meters must be a positive integer.'),
    body('contractor').trim().optional({ checkFalsy: true }), // Optional field
    body('start_date').isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD).'),
    body('end_date').isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after the start date.');
        }
        return true;
      }),
  ],
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, size_square_meters, contractor, start_date, end_date } = req.body;

    try {
      const [result] = await db.execute('INSERT INTO projects (name, size_square_meters, contractor, start_date, end_date) VALUES (?, ?, ?, ?, ?)', [name, size_square_meters, contractor, start_date, end_date]);
      res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Update a project
router.put('/:projectId', async (req, res) => {
    // Route implementation
});

// Delete a project
router.delete('/:projectId', async (req, res) => {
    // Route implementation
});

// Get a single project
router.get('/:projectId', async (req, res) => {
    // Route implementation
});

// List all projects
router.get('/', async (req, res) => {
    // Route implementation
});

module.exports = router;
