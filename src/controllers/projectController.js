// controllers/projectController.js

const { body, validationResult } = require('express-validator');
const multer = require('multer');
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

exports.upload = upload.fields([
  { name: 'address_of_the_first_file', maxCount: 1 },
  { name: 'address_of_the_second_file', maxCount: 1 }
]);

exports.validateProject = [
  body('name').notEmpty().withMessage('Name is required'),
  body('size_square_meters').isNumeric().withMessage('Size in square meters must be a number'),
  body('contractor').notEmpty().withMessage('Contractor is required'),
  body('start_date').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid date'),
  body('application_type').isIn(['مسکونی', 'تجاری', 'مسکونی و تجاری', 'صنعتی', 'آموزشی', 'بهداشتی و درمانی', 'معدن', 'خدماتی(هتل، مسافرخانه و ...)', 'ورزشی']).withMessage('Invalid application type'),
  body('number_of_floors').isInt().withMessage('Number of floors must be an integer'),
  body('employee_id').isInt().withMessage('Employee ID must be an integer'),
  body('consultant').notEmpty().withMessage('Consultant is required'),
  body('supervisor').notEmpty().withMessage('Supervisor is required'),
  body('number_of_manpower').isInt().withMessage('Number of manpower must be an integer'),
  body('province_id').isInt().withMessage('Province ID must be an integer')
];

exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, size_square_meters, contractor, start_date, end_date, application_type, number_of_floors, employee_id, consultant, supervisor, number_of_manpower, province_id } = req.body;
  const address_of_the_first_file = req.files['address_of_the_first_file'] ? req.files['address_of_the_first_file'][0].path : '';
  const address_of_the_second_file = req.files['address_of_the_second_file'] ? req.files['address_of_the_second_file'][0].path : '';

  try {
    const result = await db.query(
      'INSERT INTO projects (name, size_square_meters, contractor, address_of_the_first_file, address_of_the_second_file, start_date, end_date, application_type, number_of_floors, employee_id, consultant, supervisor, number_of_manpower, province_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, size_square_meters, contractor, address_of_the_first_file, address_of_the_second_file, start_date, end_date, application_type, number_of_floors, employee_id, consultant, supervisor, number_of_manpower, province_id]
    );
    
    res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Query to get the project details
    const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Query to get the Excel file content associated with the project
    const [excelData] = await db.query('SELECT * FROM project_excel_files WHERE project_id = ?', [projectId]);

    // Return both project details and Excel file content
    res.status(200).json({
      project,
      excelData
    });
  } catch (error) {
    console.error('Failed to retrieve project and Excel data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  const errors = validationResult(req);

  // Validation check
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract project fields and excelUpdates from request body
  const {
    name,
    size_square_meters,
    contractor,
    start_date,
    end_date,
    application_type,
    number_of_floors,
    employee_id,
    consultant,
    supervisor,
    number_of_manpower,
    province_id,
    excelUpdates // An array of updates for the project_excel_files table
  } = req.body;

  // Handle file paths for uploaded files (if any)
  const address_of_the_first_file = req.files['address_of_the_first_file'] ? req.files['address_of_the_first_file'][0].path : '';
  const address_of_the_second_file = req.files['address_of_the_second_file'] ? req.files['address_of_the_second_file'][0].path : '';

  try {
    // Retrieve existing project for validation and file deletion
    const [existingProject] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove old files if new ones are uploaded
    if (address_of_the_first_file && existingProject[0].address_of_the_first_file) {
      fs.unlinkSync(existingProject[0].address_of_the_first_file);
    }
    if (address_of_the_second_file && existingProject[0].address_of_the_second_file) {
      fs.unlinkSync(existingProject[0].address_of_the_second_file);
    }

    // Update project details in the projects table
    await db.query(
      'UPDATE projects SET name = ?, size_square_meters = ?, contractor = ?, address_of_the_first_file = ?, address_of_the_second_file = ?, start_date = ?, end_date = ?, application_type = ?, number_of_floors = ?, employee_id = ?, consultant = ?, supervisor = ?, number_of_manpower = ?, province_id = ? WHERE id = ?',
      [
        name,
        size_square_meters,
        contractor,
        address_of_the_first_file || existingProject[0].address_of_the_first_file,
        address_of_the_second_file || existingProject[0].address_of_the_second_file,
        start_date,
        end_date,
        application_type,
        number_of_floors,
        employee_id,
        consultant,
        supervisor,
        number_of_manpower,
        province_id,
        projectId
      ]
    );

    // Update related rows in the project_excel_files table
    if (excelUpdates && excelUpdates.length > 0) {
      for (const update of excelUpdates) {
        const { id, status, actual_cost, subtask_progress } = update;

        // Update the corresponding row in project_excel_files
        await db.query(
          'UPDATE project_excel_files SET status = ?, actual_cost = ?, subtask_progress = ? WHERE project_id = ? AND id = ?',
          [status, actual_cost, subtask_progress, projectId, id]
        );
      }
    }

    res.status(200).json({ message: 'Project and Excel data updated successfully' });
  } catch (error) {
    console.error('Failed to update project:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.deleteProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Query to check if the project exists
    const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If there are associated files, remove them from the file system
    if (project[0].address_of_the_first_file) {
      fs.unlinkSync(project[0].address_of_the_first_file);
    }
    if (project[0].address_of_the_second_file) {
      fs.unlinkSync(project[0].address_of_the_second_file);
    }

    // Delete the related Excel data from the project_excel_files table
    await db.query('DELETE FROM project_excel_files WHERE project_id = ?', [projectId]);

    // Delete the project itself from the projects table
    await db.query('DELETE FROM projects WHERE id = ?', [projectId]);

    res.status(200).json({ message: 'Project and associated files deleted successfully, including Excel data' });
  } catch (error) {
    console.error('Failed to delete project and associated data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};






