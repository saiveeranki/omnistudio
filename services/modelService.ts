
import { GoogleGenAI } from "@google/genai";

export class ModelService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateText(prompt: string, provider: string, model: string) {
    if (provider.includes('Local')) {
      return this.generateOllamaText(prompt, model);
    }
    
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: model || 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are a helpful assistant in a Streamlit-style environment."
      }
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  }

  private static async generateOllamaText(prompt: string, model: string) {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          messages: [{ role: 'user', content: prompt }],
          stream: false
        })
      });
      
      if (!response.ok) throw new Error('Ollama connection failed. Ensure OLLAMA_ORIGINS is set and ollama is running.');
      
      const data = await response.json();
      return data.message.content;
    } catch (err) {
      throw new Error(`Local Engine Error: ${err instanceof Error ? err.message : 'Is Ollama running?'}`);
    }
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
