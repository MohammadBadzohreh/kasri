const { Console } = require('console');
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
        console.log(filePath);
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const firstSheet = workbook.Sheets[sheetNames[0]];

        // Convert the sheet data to JSON
        const jsonData = xlsx.utils.sheet_to_json(firstSheet);
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
                'پیش‌نیاز': prerequisite,
                'درصد کار ': workProgress,
                'وضعیت ': status,
                'هزینه واقعی': actualCost,
                'درصد انجام کار ساب تسک': subtaskProgress,
                'هزینه پیش بینی': forecastedCost,
                'درصد کار پیش بینی ساب تسک ': subtaskForecastedProgress,
                'زمان شروع پیش بینی ': forecastedStartDate,
                'زمان پایان پیش بینی ': forecastedEndDate,
                'زمان پایان واقعی': actualEndDate
            } = row;

            // Perform calculations if values are valid
            let pv = null, ev = null, ac = null, cpi = null, spi = null, sv = null;

            if (estimatedCost != null && subtaskForecastedProgress != null) {
                pv = estimatedCost * (subtaskForecastedProgress / 100);
            }

            if (estimatedCost != null && subtaskProgress != null) {
                ev = estimatedCost * (subtaskProgress / 100);
            }

            if (actualCost != null) {
                ac = actualCost;
            }

            if (ev != null && ac != null && ac !== 0) {
                cpi = ev / ac;
            }

            if (ev != null && pv != null && pv !== 0) {
                spi = ev / pv;
            }

            if (ev != null && pv != null) {
                sv = ev - pv;
            }

            console.log('PV:', pv, 'EV:', ev, 'AC:', ac, 'CPI:', cpi, 'SPI:', spi, 'SV:', sv);

            // Skip rows missing required data
            if (!wbs || !wbsName || !description || !resources || !date) {
                console.log('Skipping row due to missing essential data:', row);
                continue;
            }

            // Insert the data into your MySQL table
            await db.query(
                `INSERT INTO project_excel_files (project_id, wbs, wbs_name, description, resources, date, estimated_cost, deliverables, prerequisite, work_progress, status, actual_cost, subtask_progress, forecasted_cost, subtask_forecasted_progress, forecasted_start_date, forecasted_end_date, actual_end_date, pv, ev, ac, cpi, spi, sv)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    projectId, wbs, wbsName, description, resources, date, 
                    estimatedCost, deliverables, prerequisite, workProgress, 
                    status, actualCost, subtaskProgress, forecastedCost, 
                    subtaskForecastedProgress, forecastedStartDate, forecastedEndDate, 
                    actualEndDate, pv, ev, ac, cpi, spi, sv
                ]
            );
        }

        res.status(200).json({
            message: 'File uploaded, data extracted, calculated, and saved to the database successfully',
            project_id: projectId,
            data: jsonData
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};





exports.updateSubtask = async (req, res) => {
    const { projectId, subtaskId } = req.params;
    const { subtask_progress } = req.body;

    if (subtask_progress === undefined || subtask_progress === null || subtask_progress === '') {
        return res.status(400).json({ message: 'Subtask progress is required' });
    }
    if (subtask_progress < 0 || subtask_progress > 100) {
        return res.status(400).json({ message: 'Subtask progress must be a percentage between 0 and 100' });
    }

    // Determine the status based on subtask progress
    let status = 'Not Started';
    if (subtask_progress === 100) {
        status = 'done';
    } else if (subtask_progress > 0 && subtask_progress < 100) {
        status = 'inProgress';
    }

    try {
        // Log the projectId, subtaskId, and subtask_progress for debugging
        console.log('Updating subtask for project:', projectId, 'Subtask ID:', subtaskId, 'Subtask Progress:', subtask_progress);

        // Check if the subtask exists and belongs to the given project
        const [subtask] = await db.query(
            `SELECT * FROM project_excel_files WHERE project_id = ? AND id = ?`,
            [projectId, subtaskId]
        );

        // Log the retrieved subtask
        console.log('Retrieved subtask:', subtask);

        // If the subtask does not exist (empty array), return a 404 error
        if (subtask.length === 0) {
            return res.status(404).json({ message: 'Subtask not found or does not belong to this project' });
        }

        // Update the subtask in the database
        await db.query(
            `UPDATE project_excel_files 
         SET subtask_progress = ?, status = ? 
         WHERE project_id = ? AND id = ?`,
            [subtask_progress, status, projectId, subtaskId]
        );

        // Log the successful update
        console.log('Subtask updated successfully for project:', projectId, 'Subtask ID:', subtaskId);

        // Send the response back to Postman with the updated details
        res.status(200).json({
            message: 'Subtask updated successfully',
            project_id: projectId,
            subtask_id: subtaskId,
            new_status: status,
            new_subtask_progress: subtask_progress
        });
    } catch (error) {
        console.error('Failed to update subtask:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




