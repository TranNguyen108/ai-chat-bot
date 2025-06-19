import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoginRegister from './LoginRegister';

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
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/v2';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (user && activeConversationId) fetchHistory();
  }, [user, activeConversationId]);

  // Khi user thay đổi, lưu vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('chatai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatai_user');
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversations/${user.user_id}/`);
      setConversations(res.data.conversations || []);
      if (res.data.conversations && res.data.conversations.length > 0) {
        setActiveConversationId(res.data.conversations[0].id);
        setCurrentTitle(res.data.conversations[0].title || 'New Chat');
      }
    } catch (error) {
      setConversations([]);
    }
  };

  const fetchHistory = async () => {
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
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;
    let conversationId = activeConversationId;
    // Nếu chưa có conversation, tự động tạo mới
    if (!conversationId) {
      try {
        const res = await axios.post(`${API_BASE_URL}/conversations/${user.user_id}/new/`, { title: 'New Chat' });
        if (res.data && res.data.conversation) {
          conversationId = res.data.conversation.id;
          setActiveConversationId(conversationId);
          setCurrentTitle(res.data.conversation.title);
          fetchConversations();
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
    const userMessage = {
      id: Date.now(),
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/history/${user.user_id}/${conversationId}/`, {
        message: messageText,
        role: 'user'
      });
      if (res.data && res.data.ai_message) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: res.data.ai_message.content,
          type: 'ai',
          timestamp: new Date().toISOString()
        }]);
      } else {
        fetchHistory();
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
    }
  };

  const startNewChat = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/conversations/${user.user_id}/new/`, { title: 'New Chat' });
      if (res.data && res.data.conversation) {
        setActiveConversationId(res.data.conversation.id);
        setCurrentTitle(res.data.conversation.title);
        setMessages([]);
        fetchConversations();
      }
    } catch (error) {
      // fallback: vẫn tạo session local nếu lỗi
      setMessages([]);
      setCurrentTitle('New Chat');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
    setCurrentTitle('New Chat');
    localStorage.removeItem('chatai_user');
  };

  const deleteConversationHistory = async (conversationId) => {
    if (!window.confirm('Bạn có chắc muốn xoá toàn bộ lịch sử chat của đoạn này?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/history/${user.user_id}/${conversationId}/`);
      // Sau khi xoá, reload lại danh sách conversation và chuyển sang đoạn chat khác (nếu có)
      fetchConversations();
      if (conversations.length > 1) {
        const nextConv = conversations.find(c => c.id !== conversationId);
        setActiveConversationId(nextConv?.id || null);
      } else {
        setActiveConversationId(null);
        setMessages([]);
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
      fetchConversations();
    } catch (error) {
      alert('Đổi tên đoạn chat thất bại!');
    }
  };

  if (!user) {
    return <LoginRegister onAuth={setUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={startNewChat}
        user={user}
        onLogout={handleLogout}
        onDeleteConversation={deleteConversationHistory}
        onRenameConversation={renameConversation}
      />
      <div className="flex-1 flex flex-col">
        <ChatHeader title={currentTitle} />
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456l-3.618 1.028a.75.75 0 01-.93-.93l1.028-3.618A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Send a message to begin chatting with AI</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}
              {isLoading && (
                <ChatMessage isLoading={true} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default App;
