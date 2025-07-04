# 🤖 Chat AI App với React và Django

Ứng dụng chat AI sử dụng Google Gemini API, được xây dựng với React frontend và Django backend.

## 🚀 Tính năng

- ✅ Chat trực tiếp với Gemini AI
- ✅ **AI nhớ lịch sử hội thoại** - AI có thể th   │   ├── asgi.py             │   │   ├── ChatInput.jsx    # Message input
   │   │   ├── UserProfilePage.jsx
   │   │   └── ...              # Other componentsASGI config
   │   ├── wsgi.py           # WSGI config chiếu đến các tin nhắn trước đó trong cuộc trò chuyện
- ✅ **Chia sẻ đoạn chat qua mã** - Share conversation với người khác qua room code (via Sidebar)
- ✅ **Hiển thị tên người gửi** - Hiện tên user trong mỗi tin nhắn
- ✅ Lưu trữ lịch sử cuộc trò chuyện với Django ORM (SQLite)
- ✅ Giao diện người dùng thân thiện, hiện đại
- ✅ Đăng nhập/đăng ký, lưu đăng nhập tự động (không bị đăng xuất khi reload)
- ✅ **Sidebar quản lý conversation** - Tạo, đổi tên, xoá, share/join conversation trực tiếp
- ✅ Join/Leave shared conversations
- ✅ Khi chat mới (hoặc khi chưa có conversation), hệ thống tự động tạo conversation mới
- ✅ Admin interface để quản lý
- ✅ API RESTful
- ✅ Responsive design

## 🛠️ Công nghệ sử dụng

### Backend (Django)
- Django 5.2.3
- **Django REST Framework 3.14.0** - API endpoints
- **Google Generative AI 0.8.3** - Gemini API integration
- **Django CORS Headers 4.3.1** - CORS support
- **SQLite Database** - Local database storage

### Frontend (React)
- React 19.1.0
- **Vite 6.3.5** - Build tool và dev server
- **Axios 1.10.0** - HTTP client cho API calls
- **Heroicons React 2.2.0** - Icon library
- **Tailwind CSS 3.4.17** - Styling framework

## 📋 Yêu cầu hệ thống

### Phần mềm cần cài đặt:
- **Python 3.8+** (khuyến nghị Python 3.10+)
- **Node.js 16+** (khuyến nghị Node.js 18+)
- **npm** hoặc **yarn**
- **Git** (để clone repository)

### API Keys cần có:
- **Google Gemini API Key** - Lấy từ [Google AI Studio](https://makersuite.google.com/app/apikey)

## 📋 Cài đặt và chạy

### 📥 Bước 1: Clone repository
```bash
git clone <repository-url>
cd ai-chat-bot
```

### 🔧 Bước 2: Cấu hình Backend (Django)

#### 2.1. Tạo và kích hoạt virtual environment (khuyến nghị)
```bash
# Windows
cd backend
python -m venv venv
venv\Scripts\activate

# macOS/Linux
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 2.2. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

#### 2.3. Tạo file .env
Tạo file `.env` trong thư mục `backend/` với nội dung:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
```

#### 2.4. Chạy migrations và tạo superuser
```bash
python manage.py migrate
python manage.py createsuperuser
```

#### 2.5. Khởi động Django server
```bash
python manage.py runserver
```
Server sẽ chạy tại: **http://127.0.0.1:8000/**

### ⚛️ Bước 3: Cấu hình Frontend (React)

#### 3.1. Cài đặt dependencies (mở terminal mới)
```bash
cd frontend
npm install
```

#### 3.2. Khởi động Vite dev server
```bash
npm run dev
```
Frontend sẽ chạy tại: **http://localhost:5177/** (hoặc port khác nếu 5177 đã được sử dụng)

### ✅ Bước 4: Kiểm tra hệ thống

1. **Backend**: http://127.0.0.1:8000/ (hiển thị Django page)
2. **Frontend**: http://localhost:5177/ (hiển thị Chat AI app)
3. **Admin**: http://127.0.0.1:8000/admin/ (đăng nhập bằng superuser)

## 🔧 Cấu hình chi tiết

### Biến môi trường (.env)
Tạo file `.env` trong thư mục `backend/` với các biến sau:

```env
# Required - Lấy từ Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Security - Tạo secret key mới cho production
SECRET_KEY=django-insecure-your-secret-key-here

# Debug mode - Set False cho production
DEBUG=True
```

### Cấu trúc database (Django Models)
Hệ thống sử dụng **Django ORM** với **SQLite** database local:

#### Models chính:
- **User** (Django built-in): Quản lý người dùng
- **ChatSession**: Conversations/đoạn chat
  - `user`: Owner của conversation
  - `title`: Tên đoạn chat
  - `is_shared`: Có phải shared conversation
  - `room_code`: Mã để chia sẻ
  - `shared_users`: Danh sách users được share
- **Message**: Tin nhắn trong conversation
  - `user`: Người gửi
  - `session`: Thuộc conversation nào
  - `content`: Nội dung tin nhắn
  - `role`: 'user' hoặc 'assistant'
  - `user_name`: Tên hiển thị người gửi

### Cấu hình CORS
Backend đã được cấu hình để accept requests từ:
- http://localhost:5173
- http://localhost:5174
- http://localhost:5175
- http://localhost:5176
- http://localhost:5177

## 📡 API Endpoints

### Authentication API
- **POST** `/api/v2/register/` — Đăng ký tài khoản
  ```json
  {
    "username": "username",
    "email": "user@example.com", 
    "password": "password123"
  }
  ```
- **POST** `/api/v2/login/` — Đăng nhập
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Conversations API
- **GET** `/api/v2/conversations/<user_id>/` — Lấy danh sách conversations
- **POST** `/api/v2/conversations/<user_id>/new/` — Tạo conversation mới
  ```json
  {
    "title": "Tên conversation"
  }
  ```
- **PATCH** `/api/v2/conversations/<user_id>/` — Đổi tên conversation
  ```json
  {
    "conversation_id": "123",
    "title": "Tên mới"
  }
  ```

### Chat History API
- **GET** `/api/v2/history/<user_id>/<conversation_id>/` — Lấy lịch sử chat
- **POST** `/api/v2/history/<user_id>/<conversation_id>/` — Gửi tin nhắn
  ```json
  {
    "message": "Tin nhắn của user",
    "role": "user"
  }
  ```
- **DELETE** `/api/v2/history/<user_id>/<conversation_id>/` — Xóa conversation

### Sharing API  
- **POST** `/api/share/` — Chia sẻ conversation
  ```json
  {
    "user_id": "123",
    "conversation_id": "456"
  }
  ```
- **POST** `/api/join/` — Tham gia shared conversation
  ```json
  {
    "user_id": "123", 
    "room_code": "ABC123"
  }
  ```

### Other APIs
- **GET** `/api/v2/notifications/` — Lấy thông báo system
- **POST** `/api/v2/upload/` — Upload file (nếu có)

## 🌐 URLs và Ports

- **React Frontend**: http://localhost:5177/ (hoặc port được assign tự động)
- **Django Backend**: http://127.0.0.1:8000/
- **Django Admin**: http://127.0.0.1:8000/admin/

## 📂 Cấu trúc dự án

```
ai-chat-bot/
├── backend/                    # Django Backend
│   ├── backend/               # Main Django app
│   │   ├── __init__.py
│   │   ├── settings.py        # Django settings
│   │   ├── urls.py           # Main URL config
│   │   ├── api_urls.py       # API URL patterns
│   │   ├── asgi.py           # ASGI config cho WebSocket
│   │   ├── wsgi.py           # WSGI config
│   │   ├── auth_views_local.py      # Authentication views
│   │   ├── chat_history_views_local.py  # Chat API views
│   │   ├── sharing_views.py         # Share/Join views
│   │   ├── notifications_api.py     # Notifications API
│   │   └── file_upload_api.py       # File upload API
│   ├── chat/                  # Chat app
│   │   ├── models.py         # ChatSession, Message models
│   │   ├── admin.py          # Admin interface config
│   │   └── ...
│   ├── chatapp/              # Additional chat features
│   ├── templates/            # Django templates
│   ├── media/               # Uploaded files
│   ├── manage.py            # Django management
│   ├── requirements.txt     # Python dependencies
│   ├── db.sqlite3          # SQLite database
│   └── .env                # Environment variables
├── frontend/                 # React Frontend  
│   ├── src/
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # React entry point
│   │   ├── LoginRegister.jsx # Auth component
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Conversation sidebar
│   │   │   ├── ChatHeader.jsx   # Chat header
│   │   │   ├── ChatMessage.jsx  # Message component
│   │   │   ├── ChatInput.jsx    # Message input
│   │   │   ├── UserProfilePage.jsx
│   │   │   └── GroupChat.jsx    # Group chat page
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── postcss.config.js    # PostCSS config
├── README.md                # Tài liệu này
└── .gitignore              # Git ignore rules
```

## 🎯 Cách sử dụng

### 🚀 Khởi động hệ thống (Hàng ngày)

#### Cách nhanh (Chạy từ thư mục gốc):
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 💬 Chat AI thông thường
1. **Truy cập ứng dụng**: http://localhost:5177/
2. **Đăng ký/Đăng nhập**: 
   - Tạo tài khoản mới hoặc đăng nhập
   - Tài khoản sẽ được lưu tự động (không bị đăng xuất khi reload)
3. **Bắt đầu chat**: 
   - Nhập tin nhắn và nhấn "Gửi" 
   - Nếu chưa có conversation, hệ thống sẽ tự động tạo mới
4. **Quản lý đoạn chat trên Sidebar**: 
   - **Tạo mới**: Click "New Chat" hoặc gửi tin nhắn khi chưa có conversation
   - **Đổi tên**: Right-click conversation trong Sidebar → "Rename"
   - **Xóa**: Right-click conversation → "Delete"
   - **Chia sẻ**: Click nút "Share" → Copy room code và gửi cho bạn bè
   - **Tham gia**: Click nút "Join Chat" → Nhập room code để join conversation
5. **Xem lịch sử**: Click vào conversation trong Sidebar để xem lại

### 👥 Shared Conversations (Chat cùng người khác)
1. **Chia sẻ conversation**:
   - Tạo hoặc mở conversation hiện có
   - Click nút **"Share"** trên Sidebar
   - Copy **room code** và chia sẻ với bạn bè

2. **Tham gia shared conversation**:
   - Click nút **"Join Chat"** trên Sidebar
   - Nhập **room code** nhận được
   - Click "Join" để tham gia

3. **Chat với nhiều người**:
   - Gửi tin nhắn sẽ hiện cho tất cả thành viên của conversation
   - **Tên người gửi** hiển thị bên cạnh mỗi tin nhắn
   - AI sẽ tham gia trò chuyện và ghi nhớ lịch sử toàn bộ cuộc hội thoại
   - Xem danh sách participants trong conversation info

4. **Rời shared conversation**:
   - Delete conversation từ Sidebar (chỉ rời khỏi, không xóa cho người khác)
   - Hoặc owner có thể xóa hoàn toàn conversation

### 🔧 Admin Interface
1. **Truy cập**: http://127.0.0.1:8000/admin/
2. **Đăng nhập**: Sử dụng tài khoản superuser đã tạo
3. **Quản lý**:
   - **Users**: Xem/chỉnh sửa user accounts
   - **Chat sessions**: Xem/quản lý conversations
   - **Messages**: Xem/xóa tin nhắn
   - **Groups**: Quản lý user groups và permissions

### � Debug và Troubleshooting

#### Kiểm tra logs:
```bash
# Backend logs
cd backend
python manage.py runserver --verbosity=2

# Frontend logs - Xem Console trong browser (F12)
```

#### Lỗi thường gặp:
- **500 Error**: Kiểm tra GEMINI_API_KEY trong .env
- **CORS Error**: Kiểm tra CORS settings trong backend/settings.py
- **Connection refused**: Đảm bảo backend đang chạy port 8000
- **User not found**: Xóa localStorage và đăng nhập lại
- **API 404**: Kiểm tra URL endpoints trong backend/api_urls.py
- **Share/Join không hoạt động**: Kiểm tra database và user permissions

### �📱 Tính năng nâng cao

#### File Upload (nếu được enable):
- Upload ảnh, documents trong chat
- AI có thể phân tích nội dung file
- Xem lại files trong lịch sử chat

#### Notifications System:
- Thông báo real-time từ admin
- System announcements
- API: `/api/v2/notifications/`

#### User Profile Management:
- Click avatar để xem/chỉnh sửa profile
- Đổi username, email
- Xem thống kê chat history

## 🚀 Production Deployment

### Backend (Django)
```bash
# Tạo production settings
cp backend/backend/settings.py backend/backend/settings_prod.py

# Cập nhật settings_prod.py:
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'your-ip']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # PostgreSQL config...
    }
}

# Collect static files
python manage.py collectstatic

# Run với Gunicorn
pip install gunicorn
gunicorn backend.wsgi:application
```

### Frontend (React)
```bash
# Build production
npm run build

# Serve với nginx hoặc Apache
# Hoặc deploy lên Vercel, Netlify...
```

### Database Migration
```bash
# Backup SQLite
cp db.sqlite3 db_backup.sqlite3

# Migrate to PostgreSQL/MySQL nếu cần
python manage.py dumpdata > data.json
# Setup new database
python manage.py loaddata data.json
```

## 🔐 Security Notes

### Development:
- ✅ CORS đã được cấu hình cho localhost
- ✅ Django DEBUG=True để dễ debug
- ✅ SQLite database cho development

### Production cần chú ý:
- 🔒 Set `DEBUG=False`
- 🔒 Sử dụng PostgreSQL/MySQL thay vì SQLite
- 🔒 HTTPS/SSL certificates
- 🔒 Environment variables thật (không hard-code)
- 🔒 Rate limiting cho API
- 🔒 Backup database định kỳ

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này sử dụng MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra [Issues](https://github.com/your-repo/issues) trên GitHub
2. Tạo Issue mới với logs lỗi chi tiết
3. Join Discord/Telegram group (nếu có)

---

**Made with ❤️ by [Your Name]**


