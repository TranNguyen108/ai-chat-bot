// src/components/Sidebar.jsx

import React, { useState } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ 
    isSidebarOpen, // MỚI
    conversations, 
    activeConversationId, 
    onSelectConversation, 
    onNewChat, 
    user, 
    onLogout, 
    onDeleteConversation, 
    onRenameConversation 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveEdit = (conversationId) => {
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    handleCancelEdit();
  };

  const handleEditKeyDown = (e, conversationId) => {
    if (e.key === 'Enter') handleSaveEdit(conversationId);
    if (e.key === 'Escape') handleCancelEdit();
  };

  const ConversationItem = ({ conversation, isActive }) => (
    <div 
      className={`group flex items-center p-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-100' 
          : 'hover:bg-gray-200'
      }`}
      onClick={() => onSelectConversation(conversation.id)}
    >
      <ChatBubbleLeftIcon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
      <div className="flex-1 min-w-0">
        {editingId === conversation.id ? (
          <input
            className="text-sm font-medium text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none w-full"
            type="text"
            value={editTitle}
            autoFocus
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => handleSaveEdit(conversation.id)}
            onKeyDown={e => handleEditKeyDown(e, conversation.id)}
            onClick={e => e.stopPropagation()}
            maxLength={50}
          />
        ) : (
          <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
            {conversation.title}
          </p>
        )}
      </div>
      <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); handleStartEdit(conversation); }} className="p-1 hover:bg-gray-300 rounded">
          <PencilIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }} className="p-1 hover:bg-gray-300 rounded">
          <TrashIcon className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );

  const renderConversations = (title, convs) => (
    convs.length > 0 && (
      <div className="mb-4">
        <h2 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </h2>
        <div className="space-y-1">
          {convs.map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
            />
          ))}
        </div>
      </div>
    )
  );

  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayConversations = conversations.filter(conv => new Date(conv.created_at).toDateString() === today.toDateString());
  const recentConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate >= sevenDaysAgo && convDate.toDateString() !== today.toDateString();
  });
  const olderConversations = conversations.filter(conv => new Date(conv.created_at) < sevenDaysAgo);

  // MỚI: Dùng class để ẩn hiện sidebar
  return (
    <div className={`
      flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 ml-2">ChatAI</h1>
          </div>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {conversations.length > 0 ? (
          <>
            {renderConversations('Today', todayConversations)}
            {renderConversations('Previous 7 Days', recentConversations)}
            {renderConversations('Older', olderConversations)}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10 px-4">
            <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs text-gray-400">Start a new chat to begin.</p>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || user?.email || 'Guest User'}
              </p>
            </div>
          </div>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Đăng xuất"
            onClick={onLogout}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;