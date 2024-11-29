const express = require('express');
const app = express();
const port = 3000;
const { authenticateToken } = require('./src/middleware/authMiddleware'); // Adjust the path as needed

app.use(express.json());

// Authentication Routes
app.use('/auth', require('./src/routes/authRoutes'));


// Projects Routes with authentication
//TODO: add authentication
app.use('/projects', authenticateToken, require('./src/routes/projectRoutes'));

// Message Routes with authentication
app.use('/messages', require('./src/routes/messageRoutes'));

// document Routes
app.use('/document', require('./src/routes/documentRoutes'));

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This route is protected.' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// List all registered routes
const routes = app._router.stack
  .filter(layer => layer.route)
  .map(layer => ({
    method: Object.keys(layer.route.methods)[0].toUpperCase(),
    path: layer.route.path
  }));

console.log(routes);
