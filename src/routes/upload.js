var express = require('express');
var router = express.Router();

const upload = require('../lib/s3Upload')

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileUrl = req.file.location;

    try {
        const langChain = new LangChain(); // Initialize LangChain
        const embedding = await langChain.getEmbeddingFromFile(fileUrl); // Adjust this method based on actual library

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

module.exports = router;



