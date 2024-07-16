const db = require('../services/db'); // Adjust the path as needed
const multer = require('multer');
const fs = require('fs');

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

exports.upload = upload.array('files');

exports.sendMessage = async (req, res) => {
  const sender_id = req.user.userId; // Extract sender_id from authenticated token
  const { receiver_id, message } = req.body;
  const files = req.files ? req.files.map(file => file.path) : [];

  try {
    const result = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, message, file_path, `read`) VALUES (?, ?, ?, ?, ?)',
      [sender_id, receiver_id, message, JSON.stringify(files), false]
    );
    res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;
  const userId = parseInt(userId1); // Assuming userId1 is the parameter to check

  if (req.user.role !== 'admin' && req.user.userId !== userId && req.user.userId !== parseInt(userId2)) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  let sqlQuery;
  let sqlParams;

  if (userId2) {
    // Both userId1 and userId2 are provided, retrieve messages between both users
    sqlQuery = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)';
    sqlParams = [userId, parseInt(userId2), parseInt(userId2), userId];
  } else {
    // Only userId1 is provided, retrieve messages where userId1 is sender or receiver
    sqlQuery = 'SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ?';
    sqlParams = [userId, userId];
  }

  try {
    const [messages] = await db.execute(sqlQuery, sqlParams);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.markMessageAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    const [message] = await db.execute('SELECT * FROM messages WHERE id = ?', [messageId]);

    if (!message.length) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    const msg = message[0];

    if (req.user.role !== 'admin' && req.user.userId !== msg.receiver_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.execute('UPDATE messages SET `read` = ? WHERE id = ?', [true, messageId]);

    res.status(200).json({ message: 'Message marked as read.' });
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
