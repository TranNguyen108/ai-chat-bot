// src/components/ChatInput.jsx

import React, { useState } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { url, type }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((message.trim() || uploadedFile) && !isLoading && !uploading) {
      // Nếu có file, gửi kèm media_url và media_type
      if (uploadedFile) {
        onSendMessage({
          message,
          media_url: uploadedFile.url,
          media_type: uploadedFile.type
        });
      } else {
        onSendMessage({ message });
      }
      setMessage('');
      setFile(null);
      setUploadedFile(null);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await axios.post('http://127.0.0.1:8000/api/v2/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.file_url) {
        setUploadedFile({ url: res.data.file_url, type: res.data.media_type });
      }
    } catch (err) {
      alert('Upload file thất bại!');
      setFile(null);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedFile(null);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          {/* Nút đính kèm file */}
          <label className="cursor-pointer p-2 rounded-full hover:bg-blue-50 flex items-center justify-center">
            <PaperClipIcon className="w-5 h-5 text-blue-500" />
            <input type="file" className="hidden" onChange={handleFileChange} disabled={isLoading || uploading} />
          </label>
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Send a message... (Shift + Enter for new line)"
              disabled={isLoading || uploading}
              className="w-full p-3 pr-16 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              rows={1}
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={(!message.trim() && !uploadedFile) || isLoading || uploading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
        {/* Hiển thị file đã upload */}
        {uploadedFile && (
          <div className="flex items-center gap-2 mt-2 bg-blue-50 px-3 py-2 rounded">
            <span className="text-xs text-blue-700">
              {uploadedFile.type.startsWith('image') ? (
                <img src={uploadedFile.url} alt="uploaded" className="h-8 w-8 object-cover rounded mr-2 inline-block" />
              ) : (
                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="underline">{file?.name || 'File đã upload'}</a>
              )}
            </span>
            <button onClick={handleRemoveFile} className="ml-2 p-1 rounded hover:bg-red-100">
              <XMarkIcon className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
        {uploading && (
          <p className="text-xs text-blue-500 mt-2 text-center">Đang upload file...</p>
        )}
        {isLoading && !uploading && (
          <p className="text-xs text-gray-500 mt-2 text-center">AI is thinking...</p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;