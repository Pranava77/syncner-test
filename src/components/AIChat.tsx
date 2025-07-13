import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneIcon, Cross1Icon, RobotIcon, PersonIcon, SizeIcon, ResetIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import apiService from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    } catch (error: any) {
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

  return (
    <div className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 transition-all border border-gray-200 dark:border-gray-700 ${
      isMinimized 
        ? 'w-72 lg:w-80 h-14 lg:h-16' 
        : 'w-[calc(100vw-2rem)] max-w-sm lg:max-w-md xl:max-w-lg h-[70vh] max-h-[500px] lg:h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 lg:p-2 rounded-full">
            <RobotIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base font-heading">AI Career Mentor</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-label">
              API key required
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            {isMinimized ? <SizeIcon className="h-3 w-3 lg:h-4 lg:w-4" /> : <ResetIcon className="h-3 w-3 lg:h-4 lg:w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <Cross1Icon className="h-3 w-3 lg:h-4 lg:w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Error Banner */}
          

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4" style={{ height: 'calc(100% - 120px)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] lg:max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-1.5 lg:p-2 rounded-full flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <PersonIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-white" />
                    ) : (
                      <RobotIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-white" />
                    )}
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-xs lg:text-sm whitespace-pre-wrap break-words font-label">{message.text}</p>
                    <p className={`text-xs mt-1 font-label ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1.5 lg:p-2 rounded-full">
                    <RobotIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 lg:p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="API key required to chat"
                className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs lg:text-sm"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1.5 lg:p-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperPlaneIcon className="h-3 w-3 lg:h-4 lg:w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;