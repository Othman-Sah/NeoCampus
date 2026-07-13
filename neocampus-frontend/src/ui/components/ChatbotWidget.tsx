import React, { useState, useEffect, useRef } from 'react';
import { useChatHistory, useSendMessage } from '@/application/useCases/useChatbot';
import { useAuthStore } from '@/application/stores/authStore';
import { useTranslation } from '@/application/useCases/useTranslation';
import { MessageSquare, X, Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatbotWidget: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  const { data: serverHistory, isLoading: isLoadingHistory } = useChatHistory();
  const sendMessageMutation = useSendMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync server history to local state
  useEffect(() => {
    if (serverHistory) {
      setLocalHistory(serverHistory);
    }
  }, [serverHistory]);

  // Track unread messages when closed
  useEffect(() => {
    if (!isOpen && serverHistory && serverHistory.length > 0) {
      // Find new messages compared to what we have seen
      // Since it's a simple widget, we can just highlight if there is a new assistant reply
      const lastMessage = serverHistory[serverHistory.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [serverHistory, isOpen]);

  // Reset unread count when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [localHistory, sendMessageMutation.isPending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || sendMessageMutation.isPending) return;

    const messageText = textToSend.trim();
    setInputMessage('');

    // Optimistically add user message to local history
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString()
    };
    setLocalHistory((prev) => [...prev, tempUserMsg]);

    try {
      const response = await sendMessageMutation.mutateAsync(messageText);
      // Optimistically add assistant reply to local history
      const tempAssistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString()
      };
      setLocalHistory((prev) => [...prev, tempAssistantMsg]);
    } catch (error: any) {
      let errorMsg = language === 'fr'
        ? "Désolé, je rencontre des difficultés pour répondre. Veuillez réessayer plus tard."
        : "Sorry, I am facing difficulties responding. Please try again later.";

      if (error?.response?.status === 429) {
        errorMsg = error?.response?.data?.message || (language === 'fr'
          ? "Limite de messages dépassée. (Maximum 20 par heure)"
          : "Message limit exceeded. (Max 20 per hour)");
      }

      setLocalHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: `❌ **Error:** ${errorMsg}`,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(inputMessage);
    }
  };

  // Suggested questions based on language
  const suggestedQuestions = language === 'fr'
    ? [
        { label: "Quelles sont mes notes ?", text: "Quelles sont mes notes ?" },
        { label: "Mon emploi du temps ?", text: "Quel est mon emploi du temps ?" },
        { label: "Mes absences ?", text: "Quelles sont mes absences ?" }
      ]
    : [
        { label: "What are my grades?", text: "What are my grades?" },
        { label: "My weekly schedule?", text: "What is my weekly schedule?" },
        { label: "My absences?", text: "What are my absences?" }
      ];

  if (!user || !['eleve', 'parent', 'enseignant', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-[#d0f137]/30 hover:border-[#d0f137] group cursor-pointer"
          aria-label="Open Chatbot"
        >
          {/* Glowing pulse ring */}
          <div className="absolute inset-0 rounded-full bg-[#d0f137]/10 animate-ping opacity-75 group-hover:bg-[#d0f137]/20" />
          
          <MessageCircle className="w-6 h-6 text-[#d0f137] group-hover:rotate-12 transition-transform duration-300" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-white rounded-[24px] shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#0A0A0A] p-4 flex items-center justify-between text-white border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-[#d0f137]/50 relative">
                <Bot className="w-5 h-5 text-[#d0f137]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wide uppercase">NeoBot</span>
                  <span className="bg-[#d0f137] text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {language === 'fr' ? "Assistant Scolaire NeoCampus" : "NeoCampus School Assistant"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFDFD]">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
                <div className="w-6 h-6 border-2 border-[#d0f137] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">
                  {language === 'fr' ? "Chargement des messages..." : "Loading messages..."}
                </span>
              </div>
            ) : localHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100">
                  <Sparkles className="w-6 h-6 text-[#d0f137]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-850">
                    {language === 'fr' ? "Comment puis-je vous aider ?" : "How can I help you?"}
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-[240px] mt-1">
                    {language === 'fr'
                      ? "Posez des questions sur vos notes, vos absences, votre emploi du temps ou vos paiements."
                      : "Ask questions about your grades, attendance, timetable schedule, or finance payments."}
                  </p>
                </div>
              </div>
            ) : (
              localHistory.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2.5 animate-in fade-in duration-200`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm border border-[#d0f137]/20">
                        <Bot className="w-4.5 h-4.5 text-[#d0f137]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3.5 rounded-[20px] text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-[#0A0A0A] text-white rounded-tr-none'
                          : 'bg-neutral-50 border border-neutral-100 text-neutral-800 rounded-tl-none markdown-container'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2 border border-neutral-200 rounded-lg">
                                <table className="min-w-full divide-y divide-neutral-200">{children}</table>
                              </div>
                            ),
                            th: ({ children }) => <th className="bg-neutral-100 px-3 py-1.5 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wider">{children}</th>,
                            td: ({ children }) => <td className="px-3 py-1.5 border-t border-neutral-100 text-[11px] text-neutral-600">{children}</td>,
                            strong: ({ children }) => <strong className="font-extrabold text-neutral-900">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start items-start gap-2.5 animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4.5 h-4.5 text-[#d0f137]" />
                </div>
                <div className="bg-neutral-50 border border-neutral-100 p-3 rounded-[20px] rounded-tl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {localHistory.length === 0 && !isLoadingHistory && (
            <div className="px-4 py-2 bg-white flex flex-wrap gap-2 justify-center border-t border-neutral-50">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  className="bg-neutral-50 hover:bg-[#d0f137]/10 hover:text-[#0A0A0A] text-neutral-600 border border-neutral-200 hover:border-[#d0f137]/30 text-[10px] font-bold py-1.5 px-3 rounded-full transition-all cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3.5 bg-white border-t border-neutral-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'fr' ? "Écrivez votre message..." : "Type your message..."}
              disabled={sendMessageMutation.isPending}
              className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-[#d0f137] rounded-full px-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition disabled:opacity-60"
            />
            <button
              onClick={() => handleSend(inputMessage)}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className="w-9 h-9 rounded-full bg-[#0A0A0A] hover:bg-[#d0f137] text-[#d0f137] hover:text-black flex items-center justify-center transition shadow-md disabled:opacity-50 disabled:hover:bg-[#0A0A0A] disabled:hover:text-[#d0f137] cursor-pointer shrink-0 border-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
