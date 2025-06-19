// src/components/ChatMessage.jsx

import React from 'react';
import { 
  ArrowPathIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon, UserIcon } from '@heroicons/react/24/solid';
import { TypingIndicator } from './LoadingSpinner';

const ChatMessage = ({ message, onRegenerate, onFeedback, isLoading }) => {
  const isUser = message?.type === 'user';

  // MỚI: Giao diện Typing Indicator được cải thiện
  if (isLoading) {
    return (
      <div className="flex items-start message-enter">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm max-w-full">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  // Giao diện tin nhắn người dùng
  if (isUser) {
    return (
      <div className="flex justify-end items-start message-enter">
        <div className="bg-blue-600 text-white rounded-lg rounded-br-none p-3 max-w-lg lg:max-w-2xl">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-4">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    );
  }

  // Giao diện tin nhắn AI
  return (
    <div className="flex items-start message-enter group"> {/* MỚI: Thêm class group */}
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4">
        <SparklesIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm max-w-lg lg:max-w-2xl">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* MỚI: Các nút hành động chỉ hiện khi hover */}
        <div className="flex items-center space-x-2 mt-2 pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="flex items-center text-xs text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Regenerate
            </button>
          )}

          {onFeedback && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onFeedback(message.id, 'like')}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md"
                title="Like this response"
              >
                <HandThumbUpIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFeedback(message.id, 'dislike')}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md"
                title="Dislike this response"
              >
                <HandThumbDownIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;