const db = require('../services/db'); 
const fs = require('fs');
const xlsx = require('xlsx');


exports.uploadProjectFile = async (req, res) => {
  try {
      const projectId = req.params.project_id;

      if (!projectId) {
          return res.status(400).json({ error: "Project ID is required" });
      }

      if (!req.file) {
          return res.status(400).send('No file uploaded');
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];

      // Convert the sheet data to JSON
      const jsonData = xlsx.utils.sheet_to_json(firstSheet);

      // Log the extracted JSON data for debugging
      console.log('Extracted JSON data:', jsonData);

      // Save the JSON data and project_id to the MySQL database
      for (const row of jsonData) {
          const { 
              'WBS': wbs, 
              'WBS Name': wbsName, 
              'شرح بسته کاری': description, 
              'منابع/مسئول': resources, 
              'زمان': date, 
              'هزینه پیش بینی ': estimatedCost, 
              'اقلام قابل تحویل': deliverables, 
              'درصد کار ': workProgress, 
              'وضعیت ': status, 
              'هزینه واقعی': actualCost, 
              'درصد انجام کار ساب تسک ': subtaskProgress  // New field for subtask progress
          } = row;

          // Log the value of subtaskProgress to ensure it's being extracted
          console.log('Subtask Progress:', subtaskProgress);

          // Validate that the row contains essential data
          if (!wbs || !wbsName || !description || !resources || !date) {
              // Skip this row if it doesn't contain essential data
              console.log('Skipping row due to missing essential data:', row);
              continue;
          }

          console.log("Inserting row:", row);  // Debugging: log the row being inserted

          // Insert the data into your MySQL table, including the new subtask progress
          await db.query(
              `INSERT INTO project_excel_files (project_id, wbs, wbs_name, description, resources, date, estimated_cost, deliverables, work_progress, status, actual_cost, subtask_progress)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [projectId, wbs, wbsName, description, resources, date, estimatedCost, deliverables, workProgress, status, actualCost, subtaskProgress]
          );
      }

      res.status(200).json({
          message: 'File uploaded, data extracted, and saved to the database successfully',
          project_id: projectId,
          data: jsonData
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
};
