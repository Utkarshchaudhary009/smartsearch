import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const ResponseSchema = {
  type: Type.OBJECT,
  properties: {
    response: {
      type: Type.STRING,
      description: "The response to the user's message",
      nullable: false,
    },
    images: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "urls of the related to users message.",
      nullable: true,
    },
    video: {
      type: Type.STRING,
      description:
        "url ( youtube , tiktok ,instagram , other any othe pltform or ingeeral video url) of the related to users message.",
      nullable: true,
    },
    file: {
      type: Type.STRING,
      description:
        "url ( pdf , docx , other any other file url) of the related to users message.",
      nullable: true,
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: "url of the source",
              nullable: false,
            },
            name: {
              type: Type.STRING,
              description: "name of the source",
              nullable: false,
            },
          },
          required: ["url", "name"],
        },
      }, // source url and name
      description: "The sources used to generate the response",
      nullable: false,
    },
  },
  required: ["response", "sources"],
};

export interface Response {
  response: string;
  images: string[];
  video: string;
  file: string;
  sources: { url: string; name: string }[];
}

export const ResponseZodSchema = z.object({
  response: z.string(),
  images: z.array(z.string()),
  video: z.string(),
  file: z.string(),
  sources: z.array(z.object({ url: z.string(), name: z.string() })),
});
/**
 * Generates a text response to user queries
 * @param userMessage The user's message
 * @param chatHistory Previous messages in the conversation
 * @param genAI Google GenAI instance
 * @returns Text response from the model
 */
export async function generateChatResponse(
  userMessage: string,
  genAI: GoogleGenAI
): Promise<string> {
  const prompt = `
You are a Deep Research Agent that can answer questions, help with tasks, and provide information. Try using Fresh and popularly acepted resources


User message: ${userMessage}
`;

  // Model options with fallback
  const models = ["gemini-2.0-flash", "gemini-2.5-pro-preview-03-25"];
  let response = "";

  try {
    // Primary model with Google search capability
    console.log(`Generating response with ${models[1]}`);
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: models[1],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: ResponseSchema,
      },
    });

    response = result.text || "Sorry, I couldn't generate a response.";
    console.log(`Response generated successfully (${response.length} chars)`);
    return response;
  } catch (error) {
    // Fallback to simpler model
    try {
      console.log(`Falling back to ${models[0]}`);
      const result = await genAI.models.generateContent({
        contents: `Use google search to find the answer to the user's message: ${prompt}
        
        RESPONSE Must include all the information from the user's message and the sources(name,url) in markdown format [name](url) at the end.
        `,
        model: models[0],
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });
      console.log("result", result.text);
      // Prevent error:Unexpected non-whitespace character after JSON
      response = result.text || "Sorry, I couldn't generate a response.";
      console.log(`Fallback response generated (${response.length} chars)`);
      return response;
    } catch (fallbackError) {
      console.error("Fallback model failed:", fallbackError);
      console.error("Error with primary model:", error);
      throw new Error("Failed to generate any response");
    }
  }
}