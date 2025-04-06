import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userMessage = searchParams.get('message');

  if (!userMessage) {
    return NextResponse.json({ error: 'User message is required.' }, { status: 400 });
  }

  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });
  const prompt = `
You are an expert in generating meaningful chat slugs so that users can understand the whole conversation in that chat session.
Keep it SHORT but meaningful, in 4 to 5 words ONLY.

User message: ${userMessage}
`;

  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro-preview-03-25",
  ];

  try {
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: models[1],
      config: {
        temperature: 2,
      },
    });

    const response = result.text || "Sorry, I couldn't generate a response.";
    console.log(`Generated response for: ${userMessage.substring(0, 30)}...`);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json({ error: 'Failed to generate response.' }, { status: 500 });
  }
}

// Example usage of the API
// Fetching chat slug from the API
