import { GoogleGenAI } from "@google/genai";

export interface ThinkerResult {
  generateImage: boolean;
  prompt?: string;
  altText?: string;
  userText?: string;
}

/**
 * Analyzes a user message to determine if image generation is needed
 * @param userMessage The user's input message
 * @param genAI GoogleGenAI instance
 * @returns Object with decision and image generation details if applicable
 */
export async function thinkerFunction(
  userMessage: string,
  genAI: GoogleGenAI
): Promise<ThinkerResult> {
  // Quick check for common image-related keywords as a pre-filter
  const imageKeywords = [
    "generate image",
    "create picture",
    "draw",
    "show me image",
    "illustrate",
    "picture of",
  ];
  const quickCheck = imageKeywords.some((kw) =>
    userMessage.toLowerCase().includes(kw)
  );

  const thinkerPrompt = `Analyze the user's request: "${userMessage}".

  Based ONLY on the user's explicit request, determine if they are asking for an image to be generated.
  Keywords like "generate an image", "create a picture", "show me an image of", "draw", "illustrate" strongly suggest image generation.
  Requests like "what does X look like?" or descriptions without explicit generation commands might NOT require an image.

  Respond ONLY in JSON format with the following structure:
  {
    "generateImage": boolean, // true if an image should be generated, false otherwise
    "prompt": string | null, // If generateImage is true, provide the concise prompt for the image generation model. Extract the core subject and description. If false, this should be null.
    "altText": string | null, // If generateImage is true, suggest concise alt text for the image (max 15 words). If false, this should be null.
    "userText": string | null // If generateImage is true, provide a short, friendly text response to accompany the image for the user (e.g., "Sure, here is the image you requested:"). If false, this should be null.
  }

  Example 1:
  User Request: "Generate an image of a futuristic cityscape at sunset"
  Response: { "generateImage": true, "prompt": "futuristic cityscape at sunset", "altText": "Futuristic cityscape with tall buildings during a colorful sunset", "userText": "Okay, here's the futuristic cityscape you asked for:" }

  Example 2:
  User Request: "Tell me about the history of the Eiffel Tower."
  Response: { "generateImage": false, "prompt": null, "altText": null, "userText": null }

  Example 3:
  User Request: "Show me a picture of a cute puppy playing."
  Response: { "generateImage": true, "prompt": "cute puppy playing", "altText": "A small, adorable puppy playing joyfully", "userText": "Check out this cute puppy playing!" }

  User Request: "${userMessage}"
  Response:`;

  try {
    // Use a faster model for this decision
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: thinkerPrompt,
    });

    const responseText = result.text || "";
    console.log("Thinker analysis complete");

    // Parse JSON response
    let decision;
    try {
      // Clean potential markdown code block formatting
      const cleanedText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      decision = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse thinker JSON:", parseError);
      // Fall back to quick keyword check if parsing fails
      return { generateImage: quickCheck };
    }

    // Validate structure
    if (typeof decision.generateImage !== "boolean") {
      console.error("Invalid thinker response structure");
      return { generateImage: quickCheck };
    }

    return {
      generateImage: decision.generateImage,
      prompt: decision.prompt ?? undefined,
      altText: decision.altText ?? undefined,
      userText: decision.userText ?? undefined,
    };
  } catch (error) {
    console.error("Error in thinker function:", error);
    // Default to quick keyword check on error
    return { generateImage: quickCheck };
  }
}
