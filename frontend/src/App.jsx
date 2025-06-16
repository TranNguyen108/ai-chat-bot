import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('Photo Generation');
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/`);
      setMessages(response.data.conversation.messages);
      setActiveConversationId(conversationId);
      setCurrentTitle(response.data.conversation.title);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setCurrentTitle('New Chat');
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        message: messageText,
        conversation_id: activeConversationId
      });

      // Add hasImage flag for demo purposes - you can modify this based on your AI response
      const aiMessage = {
        ...response.data.ai_message,
        hasImage: messageText.toLowerCase().includes('cat') || messageText.toLowerCase().includes('image')
      };

      setMessages(prev => [...prev, aiMessage]);
      setActiveConversationId(response.data.conversation_id);
      fetchConversations(); // Refresh conversations list
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleTitleChange = (newTitle) => {
    setCurrentTitle(newTitle);
    // You can add API call here to update the conversation title
  };

  const handlePromptSubmit = (prompt) => {
    sendMessage(prompt);
  };

  const handleRegenerate = (messageId) => {
    // Find the message and regenerate
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.type === 'user') {
        sendMessage(previousUserMessage.content);
      }
    }
  };

  const handleFeedback = (messageId, feedbackType) => {
    console.log(`Feedback for message ${messageId}: ${feedbackType}`);
    // You can add API call here to save feedback
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={loadConversation}
        onNewChat={startNewChat}
        user={{ name: 'Emily' }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          title={currentTitle}
          onTitleChange={handleTitleChange}
          onPromptSubmit={handlePromptSubmit}
        />        {/* Messages */}
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
                  onRegenerate={handleRegenerate}
                  onFeedback={handleFeedback}
                />
              ))}
              {isLoading && (
                <ChatMessage isLoading={true} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default App;
