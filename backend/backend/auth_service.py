import bcrypt
from supabase import create_client, Client
from backend.supabase_config import supabase

# Đăng ký user mới
def register_user(email: str, password: str, role: str = 'user'):
    # Kiểm tra email đã tồn tại chưa
    existing = supabase.table('users').select('id').eq('email', email).execute()
    if existing.data:
        return {'error': 'Email already exists'}
    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    # Thêm user mới
    res = supabase.table('users').insert({
        'email': email,
        'password_hash': hashed,
        'role': role
    }).execute()
    return res.data or {'error': res.error}

# Đăng nhập
def login_user(email: str, password: str):
    user = supabase.table('users').select('*').eq('email', email).single().execute()
    if not user.data:
        return {'error': 'Invalid email or password'}
    if not bcrypt.checkpw(password.encode('utf-8'), user.data['password_hash'].encode('utf-8')):
        return {'error': 'Invalid email or password'}
    return {'id': user.data['id'], 'email': user.data['email'], 'role': user.data['role']}

# Kiểm tra phân quyền
def is_admin(user_id: str):
    user = supabase.table('users').select('role').eq('id', user_id).single().execute()
    return user.data and user.data['role'] == 'admin'

# Lưu lịch sử chat
def save_chat(user_id: str, message: str):
    res = supabase.table('chat_history').insert({
        'user_id': user_id,
        'message': message
    }).execute()
    return res.data or {'error': res.error}

# Lấy lịch sử chat của user
def get_chat_history(user_id: str):
    res = supabase.table('chat_history').select('*').eq('user_id', user_id).order('created_at').execute()
    return res.data or []
