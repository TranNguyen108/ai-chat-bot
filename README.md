# 🤖 Chat AI App với React và Django

Ứng dụng chat AI sử dụng Google Gemini API, được xây dựng với React frontend và Django backend.

## 🚀 Tính năng

- ✅ Chat trực tiếp với Gemini AI
- ✅ Lưu trữ lịch sử cuộc trò chuyện
- ✅ Giao diện người dùng thân thiện, hiện đại
- ✅ Đăng nhập/đăng ký, lưu đăng nhập tự động (không bị đăng xuất khi reload)
- ✅ Tạo, đổi tên, xoá conversation (đoạn chat) trực tiếp trên Sidebar
- ✅ Khi chat mới (hoặc khi chưa có conversation), hệ thống tự động tạo conversation mới
- ✅ Admin interface để quản lý
- ✅ API RESTful
- ✅ Responsive design

## 🛠️ Công nghệ sử dụng

### Backend (Django)
- Django 5.2.3
- Google Generative AI
- Django CORS Headers
- SQLite Database
- Supabase (lưu user, conversation, chat_history)

### Frontend (React)
- React 18
- Vite
- Axios
- CSS3 với Flexbox

## 📋 Cài đặt và chạy

### 1. Backend (Django)

```bash
cd backend
pip install django google-generativeai python-dotenv django-cors-headers
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Cấu hình

### Biến môi trường (.env)
Tạo file `.env` trong thư mục `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
SECRET_KEY=your_secret_key_here
```

### Kết nối Supabase
- Cấu hình kết nối Supabase trong `backend/backend/supabase_config.py`:

```python
SUPABASE_URL = "<YOUR_SUPABASE_URL>"
SUPABASE_KEY = "<YOUR_SUPABASE_ANON_KEY>"
```

- Các bảng Supabase cần tạo:
    - `users`: id, email, password, role
    - `conversations`: id, user_id, title, created_at
    - `chat_history`: id, user_id, conversation_id, message, role, created_at

- Phân quyền: user thường và admin (trường `role` trong bảng users)

## 📡 API Endpoints

### Chat API
- **POST** `/api/v2/register/` — Đăng ký tài khoản (email, password, role)
- **POST** `/api/v2/login/` — Đăng nhập (email, password)
- **GET** `/api/v2/conversations/<user_id>/` — Lấy danh sách conversation của user
- **POST** `/api/v2/conversations/<user_id>/new/` — Tạo conversation mới
- **PATCH** `/api/v2/conversations/<user_id>/` — Đổi tên conversation
- **DELETE** `/api/v2/history/<user_id>/<conversation_id>/` — Xoá conversation và toàn bộ lịch sử chat
- **GET** `/api/v2/history/<user_id>/<conversation_id>/` — Lấy lịch sử chat của conversation
- **POST** `/api/v2/history/<user_id>/<conversation_id>/` — Gửi tin nhắn và nhận phản hồi AI

### Admin Interface
- **URL**: http://127.0.0.1:8000/admin/
- Quản lý cuộc trò chuyện và tin nhắn

## 🌐 URLs

- **React Frontend**: http://localhost:5174/
- **Django Backend**: http://127.0.0.1:8000/
- **Django Admin**: http://127.0.0.1:8000/admin/
- **API Test**: Mở file `test_api.html` trong trình duyệt

## 📂 Cấu trúc dự án

```
Di Hoc/
├── backend/                    # Django backend
│   ├── backend/               # Django settings
│   ├── chatapp/               # Chat application
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── urls.py           # URL routing
│   │   └── admin.py          # Admin interface
│   ├── manage.py
│   └── .env                  # Environment variables
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx   # Sidebar: tạo, đổi tên, xoá conversation
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessage.jsx
│   │   ├── App.jsx           # Main app component
│   │   └── App.css           # Global styles
│   └── package.json
└── test_api.html             # API testing tool
```

## 🎯 Cách sử dụng

1. **Khởi động backend**: `python manage.py runserver`
2. **Khởi động frontend**: `npm run dev`
3. **Truy cập ứng dụng**: http://localhost:5174/
4. **Đăng nhập/đăng ký**: Tài khoản sẽ được lưu tự động, reload không bị đăng xuất
5. **Bắt đầu chat**: Nhập tin nhắn và nhấn "Gửi" (nếu chưa có conversation, hệ thống sẽ tự tạo mới)
6. **Quản lý đoạn chat**: Đổi tên, xoá conversation trực tiếp trên Sidebar
7. **Xem lịch sử**: Các cuộc trò chuyện được lưu tự động

Enjoy chatting with AI! 🤖✨
