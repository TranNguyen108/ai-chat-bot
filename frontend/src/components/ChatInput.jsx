// src/components/ChatInput.jsx

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Send a message... (Shift + Enter for new line)"
            disabled={isLoading}
            className="w-full p-3 pr-16 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
        {isLoading && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI is thinking...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;