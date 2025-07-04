// src/App.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoginRegister from './LoginRegister';
import UserProfilePage from "./components/UserProfilePage";
import { SparklesIcon } from '@heroicons/react/24/outline';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chatai_user');
    const parsedUser = saved ? JSON.parse(saved) : null;
    console.log('App startup - Initial user from localStorage:', parsedUser);
    return parsedUser;
  });

  // Add debug function to window for testing
  useEffect(() => {
    window.debugUser = () => {
      console.log('=== DEBUG USER FUNCTION ===');
      console.log('localStorage chatai_user:', localStorage.getItem('chatai_user'));
      console.log('Current user state:', user);
      console.log('user && user.user_id:', user && user.user_id);
      console.log('!user:', !user);
      console.log('!user.user_id:', !user?.user_id);
      console.log('Validation result:', (!user || !user.user_id));
      return { user, validation: (!user || !user.user_id) };
    };
  }, [user]);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('New Chat');
  const [showUserPage, setShowUserPage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const messagesEndRef = useRef(null);

  // MỚI: State để quản lý trạng thái của Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/v2';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (user && user.user_id) {
      fetchConversations();
    }
  }, [user]); // Only when user changes

  useEffect(() => {
    if (user && activeConversationId) {
        fetchHistory();
    } else {
        setMessages([]);
        setCurrentTitle('New Chat');
        setIsGroupChat(false);
    }
  }, [user, activeConversationId]); // Only when user or activeConversationId changes

  // Separate useEffect for updating title and group chat status when conversations or activeConversationId changes
  useEffect(() => {
    if (activeConversationId && conversations.length > 0) {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv) {
        if (currentTitle !== activeConv.title) {
          setCurrentTitle(activeConv.title);
        }
        // Check if this is a group chat
        const isShared = activeConv?.is_shared || false;
        if (isShared !== isGroupChat) {
          setIsGroupChat(isShared);
        }
      }
    }
  }, [activeConversationId, conversations]); // Remove isGroupChat and currentTitle from dependencies

  useEffect(() => {
    if (user) {
      localStorage.setItem('chatai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatai_user');
    }
  }, [user]);

  // Debug localStorage and user state
  useEffect(() => {
    console.log('=== USER DEBUG INFO ===');
    console.log('localStorage.getItem("chatai_user"):', localStorage.getItem('chatai_user'));
    console.log('Current user state:', user);
    console.log('user?.user_id:', user?.user_id);
    console.log('typeof user?.user_id:', typeof user?.user_id);
    console.log('========================');
  }, [user]);

  useEffect(() => {
    // Lấy thông báo từ backend admin
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v2/notifications/");
        setNotifications(res.data.notifications || []);
      } catch (e) {
        setNotifications([]);
      }
    };
    
    // Only fetch notifications once on mount
    fetchNotifications();
    
    // Set up interval to fetch notifications every 60 seconds instead of 30 to reduce server load
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = useCallback(async () => {
    // Validate user before making API call
    if (!user || !user.user_id) {
      console.log('User not loaded yet, skipping fetchConversations');
      return;
    }
    
    console.log('Fetching conversations for user:', user.user_id);
    try {
      const res = await axios.get(`${API_BASE_URL}/conversations/${user.user_id}/`);
      const fetchedConversations = res.data.conversations || [];
      setConversations(fetchedConversations);
      if (fetchedConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(fetchedConversations[0].id);
        setCurrentTitle(fetchedConversations[0].title || 'New Chat');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  }, [user]); // Remove activeConversationId dependency

  const fetchHistory = useCallback(async () => {
    if (!activeConversationId) return;
    
    // Validate user before making API call
    if (!user || !user.user_id) {
      console.log('User not loaded yet, skipping fetchHistory');
      return;
    }
    
    console.log('Fetching history for user:', user.user_id, 'conversation:', activeConversationId);
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/history/${user.user_id}/${activeConversationId}/`);
      console.log('API response history:', res.data.history);
      setMessages(res.data.history.map(msg => ({
        id: msg.id || Date.now() + Math.random(),
        content: msg.message,
        type: msg.role,
        timestamp: msg.created_at,
        user_name: msg.user_name // Đảm bảo user_name được lưu vào message
      })));
    } catch (error) {
      setMessages([]);
    } finally {
        setIsLoading(false);
    }
  }, [user, activeConversationId]);

  const sendMessage = async (input) => {
    // Validate user before making API call
    if (!user || !user.user_id) {
      console.error('User not loaded, cannot send message');
      return;
    }
    
    // input: { message, media_url, media_type } hoặc string cũ
    let messageText = typeof input === 'string' ? input : (input.message || '');
    let media_url = typeof input === 'object' ? input.media_url : undefined;
    let media_type = typeof input === 'object' ? input.media_type : undefined;
    if (!messageText.trim() && !media_url) return;

    let conversationId = activeConversationId;
    const isNewChat = !conversationId;
    // Nếu chưa có conversation, tự động tạo mới
    if (isNewChat) {
      try {
        const res = await axios.post(`${API_BASE_URL}/conversations/${user.user_id}/new/`, { title: messageText.substring(0, 30) || 'File' });
        if (res.data && res.data.conversation) {
          conversationId = res.data.conversation.id;
          setActiveConversationId(conversationId);
          setCurrentTitle(res.data.conversation.title);
          await fetchConversations();
        } else {
          throw new Error('Không tạo được đoạn chat mới');
        }
      } catch (error) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: 'Không thể tạo đoạn chat mới. Vui lòng thử lại.',
          type: 'ai',
          timestamp: new Date().toISOString(),
          user_name: 'System'
        }]);
        return;
      }
    }
    // Hiển thị tin nhắn user (có thể có file)
    const userMessage = {
      id: Date.now(),
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString(),
      media_url,
      media_type,
      user_name: user.username || user.email || 'You' // Thêm tên user
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/history/${user.user_id}/${conversationId}/`, {
        message: messageText,
        role: 'user',
        media_url,
        media_type
      });
      if (res.data && res.data.ai_message) {
        setMessages(prev => [...prev, {
          id: res.data.ai_message.id || Date.now() + 1,
          content: res.data.ai_message.content,
          type: 'ai',
          timestamp: new Date().toISOString(),
          user_name: 'AI Assistant'
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        type: 'ai',
        timestamp: new Date().toISOString(),
        user_name: 'System'
      }]);
    } finally {
      setIsLoading(false);
      if(isNewChat) {
        // Only fetch conversations if it was a new chat to avoid unnecessary calls
        try {
          const res = await axios.get(`${API_BASE_URL}/conversations/${user.user_id}/`);
          const fetchedConversations = res.data.conversations || [];
          setConversations(fetchedConversations);
        } catch (error) {
          console.error('Error refreshing conversations after new chat:', error);
        }
      }
    }
  };

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setCurrentTitle('New Chat');
    if (!isSidebarOpen) setIsSidebarOpen(true);
  }, [isSidebarOpen]);
  
  const handleLogout = useCallback(() => {
    setUser(null);
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
    setCurrentTitle('New Chat');
  }, []);

  const deleteConversationHistory = useCallback(async (conversationId) => {
    if (!window.confirm('Bạn có chắc muốn xoá toàn bộ lịch sử chat của đoạn này?')) return;
    
    // Validate user before making API call
    if (!user || !user.user_id) {
      console.error('User not loaded, cannot delete conversation');
      return;
    }
    
    console.log('Deleting conversation for user:', user.user_id, 'conversation:', conversationId);
    try {
      await axios.delete(`${API_BASE_URL}/history/${user.user_id}/${conversationId}/`);
      
      const newConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(newConversations);

      if (activeConversationId === conversationId) {
        if (newConversations.length > 0) {
          setActiveConversationId(newConversations[0].id);
        } else {
          setActiveConversationId(null);
        }
      }

    } catch (error) {
      alert('Xoá lịch sử chat thất bại!');
    }
  }, [user, conversations, activeConversationId]);

  const renameConversation = useCallback(async (conversationId, newTitle) => {
    // Validate user before making API call
    if (!user || !user.user_id) {
      console.error('User not loaded, cannot rename conversation');
      return;
    }
    
    try {
      await axios.patch(`${API_BASE_URL}/conversations/${user.user_id}/`, {
        conversation_id: conversationId,
        title: newTitle
      });
      // Cập nhật lại title trong state để giao diện phản hồi ngay lập tức
      setConversations(conversations.map(c => c.id === conversationId ? { ...c, title: newTitle } : c));
      if (activeConversationId === conversationId) {
        setCurrentTitle(newTitle);
      }
    } catch (error) {
      alert('Đổi tên đoạn chat thất bại!');
    }
  }, [user, conversations, activeConversationId]);

  const handleJoinChat = useCallback(async (conversationId) => {
    // Refresh conversations and select the joined one
    if (user && user.user_id) {
      try {
        const res = await axios.get(`${API_BASE_URL}/conversations/${user.user_id}/`);
        const fetchedConversations = res.data.conversations || [];
        setConversations(fetchedConversations);
        setActiveConversationId(conversationId);
      } catch (error) {
        console.error('Error refreshing conversations:', error);
      }
    }
  }, [user]); // Only depend on user

  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  // Check if current conversation is shared
  const currentConversation = conversations.find(c => c.id === activeConversationId);
  const isSharedConversation = currentConversation?.is_shared || false;

  if (!user) {
    return <LoginRegister onAuth={setUser} />;
  }
  if (showUserPage) {
    return (
      <UserProfilePage user={user} setUser={setUser} onClose={() => setShowUserPage(false)} />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={startNewChat}
        onDeleteConversation={deleteConversationHistory}
        onRenameConversation={renameConversation}
        onShareConversation={() => {}} // Handled in Sidebar component
        onJoinChat={handleJoinChat}
        user={user}
      />
      {/* Debug: Log user object being passed to Sidebar */}
      {console.log('App render - user passed to Sidebar:', user)}
      <main className="flex-1 flex flex-col transition-all duration-300">
        <ChatHeader
          title={currentTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onUserClick={() => setShowUserPage(true)}
          onLogout={handleLogout}
          notifications={notifications}
          onBellClick={() => setShowNotifications(true)}
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  <SparklesIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">ChatAI</h3>
                <p className="text-gray-500">Bắt đầu cuộc trò chuyện hoặc chọn một cuộc trò chuyện từ sidebar.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showUserName={true}
                />
              ))}
              {isLoading && (
                <ChatMessage isLoading={true} message={{}} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </main>
      
      {/* Share Dialog */}
      {shareDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Chat Room</h3>
            <p className="text-gray-600 mb-4">Share this code with others to let them join your conversation:</p>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={shareCode}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg text-center"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareCode);
                  alert('Đã copy mã chia sẻ!');
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShareDialogOpen(false)}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;