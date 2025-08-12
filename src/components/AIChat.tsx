import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneIcon, Cross1Icon, PersonIcon, ChatBubbleIcon as MessageCircle } from '@radix-ui/react-icons';
import apiService from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI career mentor. I can help you with learning questions, career advice, or any challenges you're facing. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await apiService.chatWithAI(input);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          text: res.data || 'No response from AI.',
          sender: 'ai',
          timestamp: new Date(),
        } as Message,
      ]);
    } catch (error: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          text: 'AI is currently unavailable. Please try again later.',
          sender: 'ai',
          timestamp: new Date(),
        } as Message,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Floating button to open modal
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 lg:p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
      >
        <div className="absolute -top-1 -left-1 lg:-top-2 lg:-left-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center animate-pulse">
          AI
        </div>
      </button>
    );
  }

  // Modal overlay and chat window
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />
      {/* Chat Modal */}
      <div 
        className="relative rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border animate-fade-in-up"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 
                className="text-lg font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                AI Career Mentor
              </h3>
              <p 
                className="text-xs font-label"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Ask anything about your career, learning, or skills!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full focus:outline-none"
          >
            <Cross1Icon className="h-5 w-5" />
          </button>
        </div>
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          style={{ backgroundColor: 'var(--color-secondary-bg)' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                  {message.sender === 'user' ? (
                    <PersonIcon className="h-4 w-4 text-white" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-2xl shadow-sm ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'}`}
                  style={{ maxWidth: '70vw', wordBreak: 'break-word' }}
                >
                  <p className="text-sm font-label whitespace-pre-wrap">{message.text}</p>
                  <span className={`block text-[10px] mt-1 font-label ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-300'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form className="flex items-center space-x-3" onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-label"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: 40, maxHeight: 120 }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <PaperPlaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;