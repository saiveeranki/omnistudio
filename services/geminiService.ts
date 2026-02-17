
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateText(prompt: string, history: { role: string; content: string }[]) {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are OmniStudio AI, a helpful multimodal assistant. You help users generate text, images, and videos. Be concise and creative."
      }
    });

    // In a real app, we'd feed history here, but for brevity we'll do simple generation
    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  }

  static async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    return imageUrl;
  }

  static async startVideoGeneration(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
    const ai = this.getAI();
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
    return operation;
  }

  static async checkVideoStatus(operation: any) {
    const ai = this.getAI();
    const currentOp = await ai.operations.getVideosOperation({ operation });
    return currentOp;
  }

  static async fetchVideoBlob(uri: string) {
    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
    return await response.blob();
  }
}
