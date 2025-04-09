import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { initSupabaseClient } from "./imageGeneration";

export interface ImageEditResult {
  imageUrl: string;
  altText: string;
  modelUsed: string;
  error?: string;
}

export async function ReadImage(imageUrl: string): Promise<Buffer> {
  try {
    const imageData = await fetch(imageUrl);
    if (!imageData.ok) {
      throw new Error("Failed to fetch image");
    }
    const arrayBuffer = await imageData.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error reading image:", error);
    throw error;
  }
}

/**
 * Generates an image using Google GenAI and stores it in Supabase
 * @param imageUrl The URL of the image to edit
 * @param prompt The text prompt for image generation
 * @param altText Optional alt text for accessibility
 * @param clerkId User ID for organizing and tracking images
 * @param genAI GoogleGenAI instance
 * @returns Object with image URL and metadata or null if generation failed
 */
export async function editAndStoreImage(
  imageUrl: string,
  prompt: string,
  altText: string | undefined,
  clerkId: string,
  genAI: GoogleGenAI
): Promise<ImageEditResult | null> {
  // Constants
  const imageModelName = "gemini-2.0-flash-exp-image-generation";
  const bucketName = "generated_images_bucket";
  let ERROR: string | null = null;
  // Initialize Supabase if not provided
  const supabaseClient = initSupabaseClient();
  if (!supabaseClient) {
    console.error("Could not initialize Supabase client");
  }
  const imageData = await ReadImage(imageUrl);
  const base64ImageData = imageData.toString("base64");
  const contents = [
    { text: prompt },
    {
      inlineData: {
        data: base64ImageData,
        mimeType: "image/png",
      },
    },
  ];
  try {
    for (let i = 0; i < 10; i++) {
      console.log(`Generating image for prompt: "${prompt}" (${i + 1}/10)`);
      // Generate the image
      let result: GenerateContentResponse | string = "Not generated";
      let publicUrl: string | null = null;
      try {
        result = await genAI.models.generateContent({
          model: imageModelName,
          contents: contents,
          config: {
            responseModalities: ["Image", "Text"],
          },
        });
      } catch (error) {
        // console.error("Error during image generation:", error);
        ERROR = error as string;
        continue;
      }
      console.log(result);
      // Validate response has image data
      for (const part of result?.candidates?.[0]?.content?.parts) {
        if (part.text) {
          console.log(part.text);
        } else if (part.inlineData) {
          const imageBuffer = Buffer.from(part.inlineData.data, "base64");

          // Create filename with user ID for organization
          const fileName = `${clerkId}/${uuidv4()}.png`
          console.log(`Image saved to: ${fileName}`);
          // Upload to Supabase Storage
          console.log(`Uploading to Supabase: ${fileName}`);
          for (let i = 0; i < 10; i++) {
            try {
              const { error: uploadError } = await supabaseClient.storage
                .from(bucketName)
                .upload(fileName, imageBuffer, {
                  contentType: part.inlineData.mimeType || "image/png",
                  cacheControl: "3600",
                  upsert: false,
                });
              if (uploadError) {
                console.error("Supabase upload error:", uploadError);
                continue;
              }
              break;
            } catch (error) {
              console.error("Supabase Error:", error);
              continue;
            }
          }

          // Get public URL
          const { data: urlData } = supabaseClient.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          if (!urlData || !urlData.publicUrl) {
            console.error("Failed to get public URL from Supabase");
            return null;
          } else {
            publicUrl = urlData.publicUrl;
            console.log(`Image uploaded successfully at: ${publicUrl}`);
          }

          if (result.promptFeedback?.blockReason) {
            console.error(
              `Generation blocked: ${result.promptFeedback.blockReason}`
            );
          }
        }
      }

      // Store metadata in database
      const finalAltText = altText || prompt.substring(0, 100);
      const data = {
        clerk_id: clerkId,
        prompt: prompt,
        alt_text: finalAltText,
        image_url: publicUrl || "Not generated",
        model_used: imageModelName,
      };
      console.log(data);
      const { error: dbError } = await supabaseClient
        .from("generated_images")
        .insert(data);

      if (dbError) {
        console.error("Database error when storing image metadata:", dbError);
      }

      return {
        imageUrl: publicUrl,
        altText: finalAltText,
        modelUsed: imageModelName,
      };
    }
  } catch (error) {
    console.error("Error during image generation or storage:", error);
    return {
      imageUrl: "Not generated",
      altText: "Not generated",
      modelUsed: "Not generated",
      error: ERROR,
    };
  }
}


