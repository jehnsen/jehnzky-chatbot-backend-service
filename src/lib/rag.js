// // rag.js
// const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
// const { MongoDBAtlasVectorSearch } = require('langchain/vectorstores/mongodb_atlas');
// const { mongoClientPromise } = require('./mongodb');
// require('dotenv').config();

// const queryRAG = async (req, res, next) => {
//   try {
//     const client = await mongoClientPromise;
//     const dbName = "ragDB";
//     const collectionName = "embeddings";
//     const collection = client.db(dbName).collection(collectionName);
//     console.log(`query`, req.body.query);
//     const query = req.body.query;
 
//     // for debugging purposes
//     const embeddings = await collection.find({}).toArray();
//     console.log(`Retrieved ${embeddings.length} embeddings from database`);
//     const results = embeddings.filter(embedding => embedding.text.includes(query)).slice(0, 5);
//     console.log(`Filtered ${results.length} results matching the query`);
//     // if (results.length === 0) {
//     //   return res.status(200).json({ message: 'No matching results found' });
//     // }
//     // for debugging

//     // Initialize the vector store
//     const vectorStore = new MongoDBAtlasVectorSearch(
//       new OpenAIEmbeddings({
//         // apiKey: process.env.OPENAI_API_KEY,
//         modelName: 'text-embedding-ada-002',
//         stripNewLines: true,
//       }), {
//         collection,
//         indexName: "ragDbSearchIndex",
//         textKey: "text",
//         embeddingKey: "embedding",
//       });

//     // Use the retriever to get relevant documents
//     const retriever = vectorStore.asRetriever({
//       searchType: "mmr",
//       searchKwargs: {
//         fetchK: 20,
//         lambda: 0.1,
//       },
//     });

//     const retrieverOutput = await retriever.getRelevantDocuments(query);
//     console.log("retrieverOutput", retrieverOutput)
//     if (retrieverOutput.length === 0) {
//       return res.status(200).json({ message: 'No matching results found' });
//     }

//     res.status(200).json({ retrieverOutput });
//   } catch (error) {
//     console.error('Error during query processing:', error);
//     res.status(500).json({ error: 'Error processing query' });
//   }
// };

// module.exports = { queryRAG };
