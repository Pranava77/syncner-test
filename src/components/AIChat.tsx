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
        <div className="absolute -top-1 -left-1 lg:-top-2 lg:-left-2 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-error)' }}>
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
            className="p-2 rounded-full focus:outline-none"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
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
                <div className="p-2 rounded-full flex-shrink-0" style={{
                  backgroundColor: message.sender === 'user' ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)'
                }}>
                  {message.sender === 'user' ? (
                    <PersonIcon className="h-4 w-4" style={{ color: 'var(--color-text-inverse)' }} />
                  ) : (
                    <MessageCircle className="h-4 w-4" style={{ color: 'var(--color-text-inverse)' }} />
                  )}
                </div>
                <div className="px-4 py-2 rounded-2xl shadow-sm rounded-br-md" style={{ 
                  maxWidth: '70vw', 
                  wordBreak: 'break-word',
                  backgroundColor: message.sender === 'user' ? 'var(--color-accent-primary)' : 'var(--color-secondary-bg)',
                  color: message.sender === 'user' ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'
                }}>
                  <p className="text-sm font-label whitespace-pre-wrap">{message.text}</p>
                  <span className="block text-[10px] mt-1 font-label" style={{ 
                    color: message.sender === 'user' ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)' 
                  }}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full" style={{
                  background: 'linear-gradient(to right, var(--color-accent-secondary), var(--color-accent-tertiary))'
                }}>
                  <MessageCircle className="h-4 w-4" style={{ color: 'var(--color-text-inverse)' }} />
                </div>
                <div className="px-4 py-2 rounded-2xl" style={{
                  backgroundColor: 'var(--color-secondary-bg)'
                }}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-text-tertiary)' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s', backgroundColor: 'var(--color-text-tertiary)' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s', backgroundColor: 'var(--color-text-tertiary)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Bar */}
        <div className="px-6 py-4 border-t" style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}>
          <form className="flex items-center space-x-3" onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none border rounded-xl px-4 py-2 text-sm font-label"
              rows={1}
              disabled={isLoading}
              style={{ 
                minHeight: 40, 
                maxHeight: 120,
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-tertiary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                background: 'linear-gradient(to right, var(--color-accent-primary), var(--color-accent-secondary))',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                if (!(!input.trim() || isLoading)) {
                  e.currentTarget.style.background = 'linear-gradient(to right, var(--color-accent-secondary), var(--color-accent-tertiary))';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!input.trim() || isLoading)) {
                  e.currentTarget.style.background = 'linear-gradient(to right, var(--color-accent-primary), var(--color-accent-secondary))';
                }
              }}
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