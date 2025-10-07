import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, X, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';

function ChatInterface({ results }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const { query, top5, transcripts, analysis } = results;

  // Load suggested questions when chat opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/chat/suggestions', {
        query,
        insights: analysis,
        videos: top5
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (questionText = null) => {
    const question = questionText || inputValue.trim();
    if (!question || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare chat history (exclude system messages)
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post('http://localhost:3000/api/chat', {
        question,
        transcripts,
        videos: top5,
        chatHistory,
        insights: analysis
      });

      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations || [],
        tokensUsed: response.data.tokensUsed
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-50"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold">Ask Questions</span>
        <Sparkles className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border-2 border-primary-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-bold">Ask About This Research</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Ask me anything about the {top5.length} videos analyzed!
            </p>
            
            {/* Suggested Questions */}
            {suggestions.length > 0 && (
              <div className="text-left space-y-2">
                <p className="text-sm font-semibold text-slate-700 mb-2">Suggested questions:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="w-full text-left px-3 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg text-sm text-slate-700 transition-colors border border-primary-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-300 space-y-1">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Sources:</p>
                  {message.citations.map((citation, idx) => (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary-700 hover:text-primary-900 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Video {citation.index + 1}: {citation.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span className="text-sm text-slate-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-slate-500 hover:text-slate-700 mb-2"
          >
            Clear conversation
          </button>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
