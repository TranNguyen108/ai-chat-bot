import React, { useState } from 'react';
import { PencilIcon, UserIcon } from '@heroicons/react/24/outline';

const ChatHeader = ({ title, onTitleChange, onPromptSubmit }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [prompt, setPrompt] = useState('');

  const handleTitleSave = () => {
    onTitleChange(titleValue);
    setIsEditingTitle(false);
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onPromptSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Editable Title */}
        <div className="flex items-center">
          {isEditingTitle ? (
            <div className="flex items-center">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none smooth-transition"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 smooth-transition btn-ghost"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="flex items-center">
          <form onSubmit={handlePromptSubmit} className="flex items-center">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-80 px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent smooth-transition"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
