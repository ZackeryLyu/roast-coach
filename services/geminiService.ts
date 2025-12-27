
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { RoastStyle, ImageData } from "../types";

export const getRoastPrompt = (style: RoastStyle, content: string, hasImage: boolean) => {
  return `Act as a world-class "Roast Coach". Your goal is to provide a hilarious, witty, and sharp critique of the user's input. 
  Style requested: ${style}.
  
  Instructions:
  1. Be creative and funny.
  2. If the input is code, roast the logic, naming, and indentation.
  3. If it's a design/image, roast the aesthetics and UI/UX.
  4. If it's text, roast the grammar, ego, or content.
  5. Keep it punchy. Use bullet points for specific "burns".
  6. Avoid extreme toxicity, keep it in the realm of "good-natured ribbing" but don't pull punches.
  7. If there is an image, refer to specific visual elements.
  
  Input to roast:
  ${content || (hasImage ? "Review the provided image." : "The user provided nothing. Roast them for their lack of contribution.")}`;
};

export async function* streamRoast(
  style: RoastStyle, 
  content: string, 
  image?: ImageData
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  if (!process.env.API_KEY) {
    yield "Error: API_KEY is missing. Please set it in your Vercel environment variables.";
    return;
  }

  const prompt = getRoastPrompt(style, content, !!image);
  const parts: any[] = [{ text: prompt }];
  
  if (image) {
    parts.push({
      inlineData: {
        data: image.base64.split(',')[1],
        mimeType: image.mimeType,
      },
    });
  }

  try {
    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    yield "Error: The roast engine encountered an error. Check your API key and network.";
  }
}
