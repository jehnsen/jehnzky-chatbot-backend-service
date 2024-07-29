const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
let bucket;

const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db('ragDB'); // Ensure 'ragDB' is your database name
    bucket = new GridFSBucket(db);
    // console.log('Database connected:', db.collection("embeddings")); // Debug log
        // for debugging
    const collection = db.collection('embeddings');
  
    const documents = await collection.find().toArray();
    // console.log(documents);
    // for debugging
    
  }
  return { db, bucket };
};

module.exports = {connectDB}

