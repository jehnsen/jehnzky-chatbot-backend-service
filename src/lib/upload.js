// upload.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { connectDB } = require('./database');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ storage });

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(201).json({ fileId: req.file.id });
};

module.exports = { upload, uploadFile };
