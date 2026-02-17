
export enum MediaType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface MediaItem {
  id: string;
  type: MediaType;
  content: string; // text or URL
  prompt: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    aspectRatio?: string;
    resolution?: string;
    operationId?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaItems?: MediaItem[];
  timestamp: number;
}
