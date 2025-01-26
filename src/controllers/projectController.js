// controllers/projectController.js

const { body, validationResult } = require('express-validator');
const multer = require('multer');
const db = require('../services/db'); // Adjust the path as needed
const fs = require('fs');

const path = require('path');
const XLSX = require('xlsx');

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
  const {userId , role} = req.user; 
    try {
      // Allow access to all projects for admin or site_manager roles
      if (role === 'admin' || role === 'site_manager') {
        console.log('Admin or Site Manager accessing the project');
      } else {
        // Check if the user has access to the project
        const [accessCheck] = await db.query(
          `SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?`,
          [projectId, userId]
        );
  
        // Deny access if the user is not linked to the project
        if (accessCheck.length === 0) {
          return res.status(403).json({ message: 'Access denied to this project' });
        }
      }
    // Query to get the project details
    const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Query to get the Excel file content associated with the project
    const excelData = await db.query(
      'SELECT * FROM project_excel_files WHERE project_id = ?',
      [projectId]
    );

    // Return both project details and Excel file content
    res.status(200).json({
      project,
      excelData,
    });
  } catch (error) {
    console.error('Failed to retrieve project and Excel data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.updateProject = async (req, res) => {
  const { projectId } = req.params;

  // Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  } = req.body;

  // Safely extract file paths
  const address_of_the_first_file = req.files?.address_of_the_first_file
    ? req.files.address_of_the_first_file[0].path
    : null;
  const address_of_the_second_file = req.files?.address_of_the_second_file
    ? req.files.address_of_the_second_file[0].path
    : null;

  try {
    // Update the project in the database
    const result = await db.query(
      `UPDATE projects
       SET name = ?, size_square_meters = ?, contractor = ?, address_of_the_first_file = ?, address_of_the_second_file = ?, start_date = ?, end_date = ?, application_type = ?, number_of_floors = ?, employee_id = ?, consultant = ?, supervisor = ?, number_of_manpower = ?, province_id = ?
       WHERE id = ?`,
      [
        name,
        size_square_meters,
        contractor,
        address_of_the_first_file,
        address_of_the_second_file,
        start_date,
        end_date,
        application_type,
        number_of_floors,
        employee_id,
        consultant,
        supervisor,
        number_of_manpower,
        province_id,
        projectId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Failed to update project:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.addUserToProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Check if the project exists
    const [project] = await db.query('SELECT 1 FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the user exists
    const [user] = await db.query('SELECT 1 FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already assigned to the project
    const [existing] = await db.query(
      'SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    console.log(existing)
    if (existing.length !==0) {
      return res.status(200).json({ message: 'User already assigned to the project' }); 
    }

    // Add the user to the project
    await db.query('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [
      projectId,
      userId,
    ]);

    res.status(201).json({ message: 'User successfully added to the project' });
  } catch (error) {
    console.error('Failed to add user to project:', error);
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


exports.getAllProjects = async (req, res) => {
  const { role, id: userId } = req.user; 
  console.log(req.user);

  try {
    let projects;

    if (role === 'admin' || role === 'site_manager') {
      projects = await db.query('SELECT * FROM projects');
    } else {
      projects = await db.query(
        `SELECT p.* 
         FROM projects p
         INNER JOIN project_users pu ON p.id = pu.project_id
         WHERE pu.user_id = ?`,
        [userId]
      );
    }

    res.status(200).json({
      message: 'Projects retrieved successfully',
      projects,
    });
  } catch (error) {
    console.error('Failed to retrieve projects:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.searchProjects = async (req, res) => {
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
    province_id
  } = req.query; // Extract query parameters

  try {
    // Initialize query and parameters
    let query = 'SELECT * FROM projects WHERE 1=1'; // Start with a condition that is always true
    const params = [];

    // Dynamically add filters based on provided query parameters
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (size_square_meters) {
      query += ' AND size_square_meters = ?';
      params.push(size_square_meters);
    }
    if (contractor) {
      query += ' AND contractor LIKE ?';
      params.push(`%${contractor}%`);
    }
    if (start_date) {
      query += ' AND start_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND end_date <= ?';
      params.push(end_date);
    }
    if (application_type) {
      query += ' AND application_type = ?';
      params.push(application_type);
    }
    if (number_of_floors) {
      query += ' AND number_of_floors = ?';
      params.push(number_of_floors);
    }
    if (employee_id) {
      query += ' AND employee_id = ?';
      params.push(employee_id);
    }
    if (consultant) {
      query += ' AND consultant LIKE ?';
      params.push(`%${consultant}%`);
    }
    if (supervisor) {
      query += ' AND supervisor LIKE ?';
      params.push(`%${supervisor}%`);
    }
    if (number_of_manpower) {
      query += ' AND number_of_manpower = ?';
      params.push(number_of_manpower);
    }
    if (province_id) {
      query += ' AND province_id = ?';
      params.push(province_id);
    }

    // Execute the query
    const [projects] = await db.query(query, params);

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Failed to search projects:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.exportToExcel = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Fetch the excelData related to the project
    const [excelData] = await db.query('SELECT * FROM project_excel_files WHERE project_id = ?', [projectId]);

    if (excelData.length === 0) {
      return res.status(404).json({ message: 'No Excel data found for the given project' });
    }

    // Remove unwanted fields from the data
    const filteredData = excelData.map(({ date, forecasted_start_date, forecasted_end_date, actual_end_date, ...rest }) => rest);

    // Create a workbook and a sheet
    const workbook = XLSX.utils.book_new();

    // Add filteredData to the sheet
    const sheetData = [Object.keys(filteredData[0])].concat(filteredData.map((data) => Object.values(data)));
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Excel Data');

    // Write the workbook to a file
    const filePath = path.join(__dirname, `../exports/excel_data_project_${projectId}.xlsx`);
    XLSX.writeFile(workbook, filePath);

    // Send the file to the client
    res.download(filePath, `excel_data_project_${projectId}.xlsx`, (err) => {
      if (err) {
        console.error('Failed to download file:', err);
        res.status(500).json({ message: 'Failed to download file' });
      }

      // Remove the file after sending it
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Failed to export Excel data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getChartData = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Fetch data related to the project
    const [excelData] = await db.query('SELECT * FROM project_excel_files WHERE project_id = ?', [projectId]);

    if (excelData.length === 0) {
      return res.status(404).json({ message: 'No data found for the given project' });
    }

    // Prepare chart data
    const chartData = {
      wbsNames: [],
      workProgress: [],
      estimatedCosts: [],
      actualCosts: [],
    };

    // Populate chart data
    excelData.forEach((row) => {
      chartData.wbsNames.push(row.wbs_name);
      chartData.workProgress.push(parseFloat(row.work_progress));
      chartData.estimatedCosts.push(parseFloat(row.estimated_cost));
      chartData.actualCosts.push(parseFloat(row.actual_cost));
    });

    // Return the data in a chart-friendly format
    res.status(200).json({
      labels: chartData.wbsNames,
      datasets: [
        {
          label: 'Work Progress (%)',
          data: chartData.workProgress,
          borderColor: 'blue',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'Estimated Cost',
          data: chartData.estimatedCosts,
          borderColor: 'green',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Actual Cost',
          data: chartData.actualCosts,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    });
  } catch (error) {
    console.error('Failed to retrieve chart data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

