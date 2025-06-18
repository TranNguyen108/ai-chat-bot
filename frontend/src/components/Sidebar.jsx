import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ conversations, activeConversationId, onSelectConversation, onNewChat, user }) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate.toDateString() === today.toDateString();
  });

  const recentConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate >= sevenDaysAgo && convDate.toDateString() !== today.toDateString();
  });

  const ConversationItem = ({ conversation, isActive }) => (
    <div 
      onClick={() => onSelectConversation(conversation.id)}
      className={`flex items-center p-3 rounded-lg cursor-pointer smooth-transition message-enter ${
        isActive 
          ? 'bg-gray-200 border-l-4 border-blue-500' 
          : 'hover:bg-gray-100'
      }`}
    >
      <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {conversation.title}
        </p>
        {conversation.last_message && (
          <p className="text-xs text-gray-500 truncate">
            {conversation.last_message}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gradient-primary">ChatAI</h1>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center p-3 card card-hover smooth-transition focus-ring"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {todayConversations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Today
            </h2>
            <div className="space-y-2">
              {todayConversations.map(conv => (
                <ConversationItem 
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                />
              ))}
            </div>
          </div>
        )}

        {recentConversations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Previous 7 Days
            </h2>
            <div className="space-y-2">
              {recentConversations.map(conv => (
                <ConversationItem 
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                />
              ))}
            </div>
          </div>
        )}

        {conversations.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400">Start a new chat to begin</p>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Emily'}
              </p>
            </div>
          </div>
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 smooth-transition focus-ring">
            <ArrowUpIcon className="w-3 h-3 inline mr-1" />
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
