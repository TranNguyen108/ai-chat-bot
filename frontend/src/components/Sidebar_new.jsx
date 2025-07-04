// src/components/Sidebar.jsx

import React, { useState } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ 
    isSidebarOpen,
    conversations, 
    activeConversationId, 
    onSelectConversation, 
    onNewChat,
    onDeleteConversation, 
    onRenameConversation,
    user // Need user for share functionality
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');

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

  const handleShareConversation = async (conversation) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v2/share/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          user_id: user.id
        })
      });
      
      const data = await response.json();
      if (data.room_code) {
        // Copy room code to clipboard
        navigator.clipboard.writeText(data.room_code);
        alert(`Mã chia sẻ: ${data.room_code}\n(Đã copy vào clipboard)`);
      } else {
        alert('Lỗi khi chia sẻ: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sharing conversation:', error);
      alert('Lỗi khi chia sẻ cuộc trò chuyện');
    }
  };

  const handleJoinChatSubmit = async () => {
    if (!joinRoomCode.trim()) return;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v2/join/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_code: joinRoomCode.trim(),
          user_id: user.id
        })
      });
      
      const data = await response.json();
      if (data.conversation_id) {
        // Successfully joined, close dialog and select conversation
        setShowJoinDialog(false);
        setJoinRoomCode('');
        // Trigger refresh of conversations (parent should refetch)
        window.location.reload(); // Simple reload for now
      } else {
        alert('Lỗi khi tham gia: ' + (data.error || 'Mã phòng không hợp lệ'));
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      alert('Lỗi khi tham gia cuộc trò chuyện');
    }
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
          <div>
            <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {conversation.title}
            </p>
            {conversation.is_shared && (
              <div className="flex items-center mt-1">
                <ShareIcon className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">
                  {conversation.room_code} • {conversation.participants?.length || 0} thành viên
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); handleShareConversation(conversation); }} 
          className="p-1 hover:bg-gray-300 rounded"
          title="Share conversation"
        >
          <ShareIcon className="w-4 h-4 text-blue-500" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleStartEdit(conversation); }} 
          className="p-1 hover:bg-gray-300 rounded"
          title="Edit title"
        >
          <PencilIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }} 
          className="p-1 hover:bg-gray-300 rounded"
          title="Delete conversation"
        >
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
              isActive={conv.id === activeConversationId}
            />
          ))}
        </div>
      </div>
    )
  );

  // Group conversations by date for better organization
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate.toDateString() === today.toDateString();
  });

  const yesterdayConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate.toDateString() === yesterday.toDateString();
  });

  const recentConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate >= weekAgo && convDate < yesterday && convDate.toDateString() !== today.toDateString();
  });

  const olderConversations = conversations.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate < weekAgo;
  });

  if (!isSidebarOpen) return null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 ml-2">ChatAI</h1>
          </div>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-2"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          <span>New Chat</span>
        </button>
        
        <button 
          onClick={() => setShowJoinDialog(true)}
          className="w-full flex items-center justify-center p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
          <span>Join Chat</span>
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {conversations.length > 0 ? (
          <>
            {renderConversations('Today', todayConversations)}
            {renderConversations('Yesterday', yesterdayConversations)}
            {renderConversations('Previous 7 Days', recentConversations)}
            {renderConversations('Older', olderConversations)}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No conversations yet</h3>
            <p className="text-xs text-gray-400">Start a new chat to begin.</p>
          </div>
        )}
      </div>

      {/* Join Chat Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tham gia cuộc trò chuyện</h3>
            <p className="text-gray-600 mb-4">Nhập mã 6 số để tham gia cuộc trò chuyện có sẵn:</p>
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              placeholder="Nhập mã phòng..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinChatSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleJoinChatSubmit}
                disabled={!joinRoomCode.trim()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                Tham gia
              </button>
              <button
                onClick={() => {setShowJoinDialog(false); setJoinRoomCode('');}}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
