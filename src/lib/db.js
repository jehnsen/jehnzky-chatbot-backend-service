// db.js
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
  }
  return { client, db, bucket };
};

module.exports = { connectDB };
