const fs = require('fs');
const path = require('path');

const ensureUploadDirectoryExists = (req, res, next) => {
  const dir = path.join(__dirname, '../uploads/messages');

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  next();
};

module.exports = ensureUploadDirectoryExists;
