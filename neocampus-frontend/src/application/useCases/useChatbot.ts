import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApiService } from '@/infrastructure/api/chatbotApiService';
import { ChatMessage } from '@/domain/entities/ChatMessage';

export const useChatHistory = () => {
  return useQuery<ChatMessage[]>({
    queryKey: ['chatbot', 'history'],
    queryFn: () => chatbotApiService.getHistory(),
    refetchOnWindowFocus: false,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (message: string) => chatbotApiService.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'history'] });
    },
  });
};
