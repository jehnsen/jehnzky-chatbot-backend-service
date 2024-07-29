const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const mongoose = require('mongoose');
const { generateEmbedding } = require('langchain'); // Adjust this import based on actual library structure



const indexRouter = require('../src/routes/index');
const usersRouter = require('../src/routes/users');

const { upload, uploadFile } = require('../src/lib/uploadxx');
const { generateEmbeddings } = require('../src/lib/embeddings');
const { queryRAG } = require('../src/lib/rag');

// load env configuration
dotenv.config();
// set the server port
const PORT = 3001 //process.env.PORT || 3001;

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const embeddingSchema = new mongoose.Schema({
    fileUrl: String,
    embedding: Array,
});
const Embedding = mongoose.model('Embedding', embeddingSchema);

// Initialize AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer for file upload to S3
const s3Upload = multer({
  storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
});

// File upload endpoint
app.post('/s3-upload', s3Upload.single('file'), async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  const fileUrl = req.file.location;

  try {
      // const langChain = new LangChain(); // Initialize LangChain
      const embedding = await generateEmbedding(fileUrl); // Adjust this method based on actual library

      const newEmbedding = new Embedding({
          fileUrl: fileUrl,
          embedding: embedding,
      });

      await newEmbedding.save();

      res.status(200).send({
          message: 'File uploaded and embedding stored successfully.',
          fileUrl: fileUrl,
          embedding: embedding,
      });
  } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).send('Internal Server Error');
  }
});



app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/upload', upload.single('file'), uploadFile);
app.post('/generate-embeddings', generateEmbeddings);
app.post('/query-rag', queryRAG);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
