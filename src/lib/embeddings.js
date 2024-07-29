// embeddings.js
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { connectDB } = require('./database');
const { ObjectId } = require('mongodb');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const csvParser = require('csv-parser');
const { PassThrough } = require('stream');

const openaiApiKey = process.env.OPENAI_API_KEY;

const splitText = (text, chunkSize = 500) => {
  const chunks = [];
  let linesFrom = 1;

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    const linesTo = linesFrom + (chunk.split('\n').length - 1);
    chunks.push({
      text: chunk,
      loc: {
        lines: {
          from: linesFrom,
          to: linesTo,
        },
      },
    });
    linesFrom = linesTo + 1;
  }
  return chunks;
};

const processFileContent = async (fileBuffer, fileType) => {
  let fileContent = '';

  switch (fileType) {
    case 'pdf':
      const pdfData = await pdfParse(fileBuffer);
      fileContent = pdfData.text;
      break;
    case 'csv':
      const csvContent = [];
      const bufferStream = new PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(csvParser())
        .on('data', (data) => csvContent.push(data))
        .on('end', () => {
          fileContent = JSON.stringify(csvContent);
        });
      await new Promise(resolve => bufferStream.on('end', resolve));
      break;
    case 'json':
      fileContent = fileBuffer.toString('utf8');
      break;
    case 'xlsx':
    case 'xls':
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      workbook.SheetNames.forEach(sheetName => {
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        fileContent += JSON.stringify(sheetData);
      });
      break;
    default:
      fileContent = fileBuffer.toString('utf8'); // Fallback for plain text
  }

  return fileContent;
};

const generateEmbeddings = async (req, res) => {
  const { fileId, fileType } = req.body;

  if (!ObjectId.isValid(fileId)) {
    return res.status(400).json({ error: 'Invalid file ID' });
  }

  if (!['pdf', 'csv', 'json', 'xlsx', 'xls', 'txt'].includes(fileType)) {
    return res.status(400).json({ error: 'Unsupported file type' });
  }

  try {
    const { db, bucket } = await connectDB();
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    const fileChunks = [];

    downloadStream.on('data', (chunk) => {
      fileChunks.push(chunk);
    });

    downloadStream.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(fileChunks);
        const fileContent = await processFileContent(fileBuffer, fileType);
        // fileBuffer.toString('utf8'); // Convert binary to text
        const chunks = splitText(fileContent);

        const embeddings = new OpenAIEmbeddings({ apiKey: openaiApiKey });

        for (const chunk of chunks) {
          console.log(`Processing chunk: ${chunk.text.slice(0, 30)}...`); // Log chunk being processed
          const [embedding] = await embeddings.embedDocuments([chunk.text]); // Using the correct method for embedding text
          await db.collection('embeddings').insertOne({ text: chunk.text, embedding, loc: chunk.loc });
          console.log(`Stored embedding for chunk: ${chunk.text.slice(0, 30)}...`); // Log storage confirmation
        }

        res.status(200).json({ message: 'Embeddings generated successfully' });
      } catch (error) {
        console.error('Error during embedding generation:', error);
        res.status(500).json({ error: 'Error generating embeddings' });
      }
    });

    downloadStream.on('error', (err) => {
      console.error('Error during file download:', err);
      res.status(500).json({ error: 'Error downloading file' });
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
};

module.exports = { generateEmbeddings };
