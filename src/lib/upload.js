const multer = require('multer');
const { connectDB } = require('./database');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFile = async (req, res, next) => {
  try {
    const { bucket } = await connectDB();

    const file = req.file;
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(file.originalname);
    readableStream.pipe(uploadStream)
      .on('error', (error) => next(error))
      .on('finish', () => res.status(200).json({ message: 'File uploaded successfully' }));
  } catch (error) {
    next(error);
    // throw new Error(error)
  }
};

module.exports = { upload, uploadFile };
