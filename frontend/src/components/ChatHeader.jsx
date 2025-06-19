// src/components/ChatHeader.jsx

import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline'; // MỚI: import icon

const ChatHeader = ({ title, onToggleSidebar }) => { // MỚI: Thêm prop onToggleSidebar
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* MỚI: Nút toggle sidebar */}
          <button 
            onClick={onToggleSidebar} 
            className="p-2 mr-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h2>
        </div>
        {/* Có thể thêm các nút khác ở đây nếu cần */}
      </div>
    </div>
  );
};

export default ChatHeader;