const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI; // your mongodb connection string
const options = {};

let client;
let mongoClientPromise;


if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}


// In production mode, it's best to not use a global variable.
client = new MongoClient(uri, options);
mongoClientPromise = client.connect();


// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.

module.exports = { mongoClientPromise };
