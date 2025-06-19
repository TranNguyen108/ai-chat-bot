// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
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
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('New Chat');
  const [showUserPage, setShowUserPage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
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
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (user && activeConversationId) {
        fetchHistory();
        const activeConv = conversations.find(c => c.id === activeConversationId);
        if (activeConv) {
            setCurrentTitle(activeConv.title);
        }
    } else {
        setMessages([]);
        setCurrentTitle('New Chat');
    }
  }, [user, activeConversationId]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('chatai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatai_user');
    }
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
    fetchNotifications();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversations/${user.user_id}/`);
      const fetchedConversations = res.data.conversations || [];
      setConversations(fetchedConversations);
      if (fetchedConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(fetchedConversations[0].id);
        setCurrentTitle(fetchedConversations[0].title || 'New Chat');
      }
    } catch (error) {
      setConversations([]);
    }
  };

  const fetchHistory = async () => {
    if (!activeConversationId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/history/${user.user_id}/${activeConversationId}/`);
      setMessages(res.data.history.map(msg => ({
        id: msg.id || Date.now() + Math.random(),
        content: msg.message,
        type: msg.role,
        timestamp: msg.created_at
      })));
    } catch (error) {
      setMessages([]);
    } finally {
        setIsLoading(false);
    }
  };

  const sendMessage = async (input) => {
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
          timestamp: new Date().toISOString()
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
      media_type
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
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        type: 'ai',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      if(isNewChat) await fetchConversations();
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setCurrentTitle('New Chat');
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };
  
  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
    setCurrentTitle('New Chat');
  };

  const deleteConversationHistory = async (conversationId) => {
    if (!window.confirm('Bạn có chắc muốn xoá toàn bộ lịch sử chat của đoạn này?')) return;
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
  };

  const renameConversation = async (conversationId, newTitle) => {
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
  };

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
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={startNewChat}
        onDeleteConversation={deleteConversationHistory}
        onRenameConversation={renameConversation}
      />
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
    </div>
  );
};

export default App;