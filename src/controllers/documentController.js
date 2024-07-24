const db = require('../services/db'); // Adjust the path as needed
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination for file uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set the file name
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'status', maxCount: 1 },
  { name: 'instructions', maxCount: 1 },
  { name: 'contract', maxCount: 1 },
  { name: 'permissions', maxCount: 1 },
  { name: 'map', maxCount: 1 }
]);

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf|dwg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Files Only!');
  }
}

exports.createDocument = async (req, res) => {
    const { name, contractor_id, description } = req.body;
    const { status, instructions, contract, permissions, map } = req.files;
  
    // Validate contractor_id exists
    const [contractor] = await db.execute('SELECT * FROM Contractor WHERE Id = ?', [contractor_id]);
    if (!contractor.length) {
      return res.status(400).json({ error: 'Invalid contractor_id' });
    }
  
    const documentData = {
      name,
      contractor_id,
      description,
      status: status ? status[0].path : null,
      instructions: instructions ? instructions[0].path : null,
      contract: contract ? contract[0].path : null,
      permissions: permissions ? permissions[0].path : null,
      map: map ? map[0].path : null
    };
  
    try {
      const [result] = await db.execute(
        'INSERT INTO Documents (name, contractor_id, description, status, instructions, contract, permissions, map) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [documentData.name, documentData.contractor_id, documentData.description, documentData.status, documentData.instructions, documentData.contract, documentData.permissions, documentData.map]
      );
      res.status(201).json({ message: 'Document created successfully', document_id: result.insertId });
    } catch (error) {
      console.error('Failed to create document:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };