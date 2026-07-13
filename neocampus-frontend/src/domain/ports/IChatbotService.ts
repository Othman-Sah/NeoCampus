import { ChatMessage } from '../entities/ChatMessage';

export interface IChatbotService {
  sendMessage(message: string): Promise<string>;
  getHistory(): Promise<ChatMessage[]>;
}
