import { axiosClient } from './axiosClient';
import { IChatbotService } from '../../domain/ports/IChatbotService';

export const chatbotApiService: IChatbotService = {
  async sendMessage(message: string) {
    const response = await axiosClient.post('/chatbot/message', { message });
    return response.data.reply;
  },

  async getHistory() {
    const response = await axiosClient.get('/chatbot/history');
    return response.data.data;
  }
};
