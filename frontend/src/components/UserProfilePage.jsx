import React, { useState } from 'react';

const UserProfilePage = ({ user, setUser, onClose }) => {
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [message, setMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Gọi API cập nhật thông tin user ở backend
    setUser({ ...user, email, avatar });
    setMessage('Cập nhật thành công!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Thông tin cá nhân</h2>
        <form onSubmit={handleSave}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-blue-400 font-bold">{user.name?.[0] || user.email?.[0] || 'U'}</span>
              )}
            </div>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 w-full text-center"
              placeholder="Link ảnh đại diện"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Để trống nếu không đổi"
            />
          </div>
          {message && <div className="mb-2 text-green-600 text-center">{message}</div>}
          <div className="flex justify-between mt-6">
            <button type="button" className="button bg-gray-200 text-blue-600" onClick={onClose}>Quay lại</button>
            <button type="submit" className="button bg-blue-600 text-white">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
