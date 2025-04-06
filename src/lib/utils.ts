import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoogleGenAI } from "@google/genai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function ChatSlugGenerator(userMessage: string) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });
  const prompt = `
You are a expterin generating meaning chatslug so thatuser can get that was the whole conversation in that cah seesion.
keep it SHORT butmeaning full. in 4 to 5 words ONLY.

User message: ${userMessage}
`;

  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro-preview-03-25",
  ];
  try {
    // Use built-in Google search for all queries first (cost-effective)
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: models[1],
      config: {
        temperature: 2,
      },
    });

    const response = result.text || "Sorry, I couldn't generate a response.";
    console.log(`Generated response for: ${userMessage.substring(0, 30)}...`);
    return response;
  } catch (error) {
    console.error("Error response:", error);
    throw new Error("Failed to generate response");
  }
}
