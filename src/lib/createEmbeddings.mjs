
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MongoClient } from "mongodb";
import "dotenv/config";

const generateEmbeddings = async () => {

    const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
    const dbName = "ragDB";
    const collectionName = "embeddings";
    const collection = client.db(dbName).collection(collectionName);

    // handler for pdf, excel, docx
    const pdfContent = await extractTextFromPdf("_assets/fcc_docs/pdfs/101.pdf")

    // const xlsxText = extractTextFromXlsx("_assets/fcc_docs/excels/sample.xlsx");

    // const docxText = await extractTextFromDocx("_assets/fcc_docs/docs/sample.docx")

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const output = await splitter.createDocuments([pdfContent[0].pageContent]);

    await MongoDBAtlasVectorSearch.fromDocuments(
        output,
        new OpenAIEmbeddings(),
        {
            collection,
            indexName: "default",
            textKey: "text",
            embeddingKey: "embedding",
        }
    );

    console.log("Done: Closing Connection");
    await client.close();

    // end: handling of excel, pdf, docx


    // const docs_dir = "_assets/fcc_docs";
    // const fileNames = await fsp.readdir(docs_dir);

    // console.log(fileNames);


    // for (const fileName of fileNames) {
    //   const document = await fsp.readFile(`${docs_dir}/${fileName}`, "utf8");
    //   console.log(`Vectorizing ${fileName}`);

    //   const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    //     chunkSize: 500,
    //     chunkOverlap: 50,
    //   });
    //   const output = await splitter.createDocuments([document]);

    //   await MongoDBAtlasVectorSearch.fromDocuments(
    //     output,
    //     new OpenAIEmbeddings(),
    //     {
    //       collection,
    //       indexName: "default",
    //       textKey: "text",
    //       embeddingKey: "embedding",
    //     }
    //   );
    // }

    // console.log("Done: Closing Connection");
    // await client.close();


}

module.exports = { generateEmbeddings };

