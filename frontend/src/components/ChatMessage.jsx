import React from 'react';
import { 
  ArrowPathIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { TypingIndicator } from './LoadingSpinner';

const ChatMessage = ({ message, onRegenerate, onFeedback, isLoading }) => {
  const isUser = message?.type === 'user';

  // Show typing indicator for loading state
  if (isLoading) {
    return (
      <div className="flex items-start mb-6 message-enter">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <SparklesIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="card p-4">
            <TypingIndicator />
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 message-enter">
        <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-600 text-white rounded-lg">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start mb-6 message-enter">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
        <SparklesIcon className="w-5 h-5 text-gray-600" />
      </div>

      {/* Message Content */}
      <div className="flex-1">
        <div className="card p-4 mb-3">
          <p className="text-gray-900 mb-4 whitespace-pre-wrap">{message.content}</p>
          
          {/* Sample Image - You can replace this with actual image from AI response */}
          {message.hasImage && (
            <div className="mb-4">
              <img 
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop&crop=face"
                alt="Generated cat image"
                className="rounded-lg max-w-sm shadow-sm card-hover smooth-transition"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="btn-secondary text-sm"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Regenerate
            </button>
          )}

          {onFeedback && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onFeedback(message.id, 'like')}
                className="p-1 text-gray-400 hover:text-green-600 smooth-transition"
                title="Like this response"
              >
                <HandThumbUpIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFeedback(message.id, 'dislike')}
                className="p-1 text-gray-400 hover:text-red-600 smooth-transition"
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
