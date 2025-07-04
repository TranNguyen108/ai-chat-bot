// src/components/ChatHeader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, UserIcon, ArrowRightOnRectangleIcon, BellIcon } from '@heroicons/react/24/outline';

const ChatHeader = ({ title, onToggleSidebar, onUserClick, onLogout, notifications, onBellClick }) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications?.length || 0;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    }
    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Nút toggle sidebar */}
          <button 
            onClick={onToggleSidebar} 
            className="p-2 mr-4 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3 relative">
          {/* Nút thông báo */}
          <button 
            className="relative w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center" 
            onClick={() => setShowNotificationsDropdown(v => !v)} 
            title="Thông báo"
          >
            <BellIcon className="w-5 h-5 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Dropdown danh sách thông báo */}
          {showNotificationsDropdown && (
            <div ref={dropdownRef} className="absolute right-12 top-12 w-80 max-h-96 bg-white shadow-lg rounded-lg border border-gray-200 z-50 overflow-y-auto animate-fade-in">
              <div className="p-3 border-b font-semibold text-gray-700 flex items-center justify-between">
                Thông báo
                <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => setShowNotificationsDropdown(false)}>Đóng</button>
              </div>
              {notifications && notifications.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <li key={n.id} className="p-3 hover:bg-gray-50">
                      <div className="text-gray-800 text-sm">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-gray-400 text-center">Không có thông báo nào.</div>
              )}
            </div>
          )}
          {/* Avatar user dẫn đến trang cá nhân */}
          <button
            className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center"
            onClick={onUserClick}
            title="Trang cá nhân"
          >
            <UserIcon className="w-5 h-5 text-blue-600" />
          </button>
          {/* Nút đăng xuất */}
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

export default ChatHeader;