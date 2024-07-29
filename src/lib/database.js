const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
let bucket;

const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db('ragDB');
    bucket = new GridFSBucket(db);
  }
  return { db, bucket };
};

module.exports = {connectDB}

