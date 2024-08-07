const db = require('../services/db'); // Adjust the path as needed
const fs = require('fs');
const xlsx = require('xlsx');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');

// Register all necessary components
Chart.register(...registerables);

exports.uploadProjectFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const projectId = req.body.project_id; // assuming project_id is sent in the request body

    // Save specific data to MySQL
    jsonData.forEach(row => {
      const query = 'INSERT INTO project_tasks (project_id, wbs_name, task_description, resources, date, cost, deliverables, prerequisites, percent_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [
        projectId,
        row['WBS Name'],
        row['شرح بسته کاری'],
        row['منابع/مسئول'],
        row['زمان'],
        row['هزینه'],
        row['اقلام قابل تحویل'],
        row['پیش‌نیاز'],
        row['درصد کار']
      ];

      db.query(query, values, (error, results) => {
        if (error) {
          console.error('Error saving data to database:', error);
        }
      });
    });

    // Process the data for the chart
    let dataByDate = {};
    jsonData.forEach(row => {
      const date = row['زمان'];
      if (!dataByDate[date]) {
        dataByDate[date] = { done: 0, inProgress: 0, notStarted: 0 };
      }
      const percent = parseFloat(row['درصد کار']) || 0;
      const status = row['وضعیت'] && row['وضعیت'].trim().toLowerCase();

      console.log(`Date: ${date}, Status: ${status}, Percent: ${percent}`);

      switch (status) {
        case 'done':
          dataByDate[date].done += percent;
          break;
        case 'in progress':
        case 'inprogress':
          dataByDate[date].inProgress += percent;
          break;
        case 'not started':
          dataByDate[date].notStarted += percent;
          break;
        default:
          console.log(`Unrecognized status: ${status}`);
          break;
      }
    });

    // Debugging: Log dataByDate to check values
    console.log('dataByDate:', dataByDate);

    // Prepare data for the chart
    const labels = Object.keys(dataByDate);
    const doneData = labels.map(date => dataByDate[date].done);
    const inProgressData = labels.map(date => dataByDate[date].inProgress);
    const notStartedData = labels.map(date => dataByDate[date].notStarted);

    // Debugging: Log chart data to check values
    console.log('doneData:', doneData);
    console.log('inProgressData:', inProgressData);
    console.log('notStartedData:', notStartedData);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Done',
          data: doneData,
          backgroundColor: '#36a2eb',
        },
        {
          label: 'In Progress',
          data: inProgressData,
          backgroundColor: '#ffcd56',
        },
        {
          label: 'Not Started',
          data: notStartedData,
          backgroundColor: '#ff6384',
        },
      ],
    };

    // Create the chart and save it as an image
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: chartData,
    });

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./chart.png', buffer);

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    // Send the JSON data back as the response
    res.json({ chartData, dataByDate });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file.');
  }
};
