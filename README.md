# 🤖 Chat AI App với React và Django

Ứng dụng chat AI sử dụng Google Gemini API, được xây dựng với React frontend và Django backend.

## 🚀 Tính năng

- ✅ Chat trực tiếp với Gemini AI
- ✅ Lưu trữ lịch sử cuộc trò chuyện
- ✅ Giao diện người dùng thân thiện
- ✅ Admin interface để quản lý
- ✅ API RESTful
- ✅ Responsive design

## 🛠️ Công nghệ sử dụng

### Backend (Django)
- Django 5.2.3
- Google Generative AI
- Django CORS Headers
- SQLite Database

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

## 📡 API Endpoints

### Chat API
- **POST** `/api/chat/` - Gửi tin nhắn và nhận phản hồi từ AI
- **GET** `/api/conversations/` - Lấy danh sách cuộc trò chuyện
- **GET** `/api/conversations/{id}/` - Xem chi tiết cuộc trò chuyện

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
│   │   │   ├── Chat.jsx      # Main chat component
│   │   │   └── Chat.css      # Chat styles
│   │   ├── App.jsx           # Main app component
│   │   └── App.css           # Global styles
│   └── package.json
└── test_api.html             # API testing tool
```

## 🎯 Cách sử dụng

1. **Khởi động backend**: `python manage.py runserver`
2. **Khởi động frontend**: `npm run dev`
3. **Truy cập ứng dụng**: http://localhost:5174/
4. **Bắt đầu chat**: Nhập tin nhắn và nhấn "Gửi"
5. **Xem lịch sử**: Các cuộc trò chuyện được lưu tự động

Enjoy chatting with AI! 🤖✨
