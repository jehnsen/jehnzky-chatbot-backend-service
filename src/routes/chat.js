// import { StreamingTextResponse, LangChainStream, Message } from 'ai';
// import { ChatOpenAI } from 'langchain/chat_models/openai';
// import { AIMessage, HumanMessage } from 'langchain/schema';


// export async function POST(req: Request) {
//     const { messages } = await req.json();
//     const currentMessageContent = messages[messages.length - 1].content;
  
//     const vectorSearch = await fetch("http://localhost:3000/api/vectorSearch", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: currentMessageContent,
//     }).then((res) => res.json());
  
//     // Given the following sections 
//     // from the freeCodeCamp.org contributor documentation, answer the 
//     // question using only that information, outputted in markdown format. 
//     // If you are unsure and the answer is not explicitly written in the documentation, 
//     // say "Sorry buddy, I don't know how to help with that."
  
//     const TEMPLATE = `You are a very enthusiastic assisstant representative who loves to help people! 
   
//     // Context sections:
//     // ${JSON.stringify(vectorSearch)}
  
//     Question: """
//     ${currentMessageContent}
//     """
//     `;
  
//     messages[messages.length - 1].content = TEMPLATE;
  
//     const { stream, handlers } = LangChainStream();
  
//     const llm = new ChatOpenAI({
//       modelName: "gpt-3.5-turbo",
//       streaming: true,
//     });
  
//     llm.call(
//         (messages as Message[]).map(m =>
//           m.role == 'user'
//             ? new HumanMessage(m.content)
//             : new AIMessage(m.content),
//         ),
//         {},
//         [handlers],
//       )
//       .catch(console.error);
  
//     return new StreamingTextResponse(stream);
//   }