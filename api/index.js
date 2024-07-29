const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

const indexRouter = require('../src/routes/index');

const { upload, uploadFile } = require('../src/lib/upload');
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

app.use('/', indexRouter);

app.post('/upload', upload.single('file'), uploadFile);
app.post('/generate-embeddings', generateEmbeddings);
// app.post('/query-rag', queryRAG);

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
