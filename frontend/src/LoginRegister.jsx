import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v2';

export default function LoginRegister({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = isLogin ? `${API_BASE_URL}/login/` : `${API_BASE_URL}/register/`;
      const res = await axios.post(url, { email, password });
      if (res.data.user_id || res.data.message) {
        onAuth({
          user_id: res.data.user_id,
          role: res.data.role || 'user',
          email,
        });
      } else {
        setError(res.data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
        </button>
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </form>
    </div>
  );
}
