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

            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="flex items-center">
          
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
