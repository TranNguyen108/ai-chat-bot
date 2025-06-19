from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .supabase_client import supabase
import google.generativeai as genai
from django.conf import settings
import uuid

genai.configure(api_key=getattr(settings, 'GEMINI_API_KEY', None))

class ConversationListView(APIView):
    def get(self, request, user_id):
        # Lấy danh sách conversation của user
        conversations = supabase.table('conversations').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        return Response({'conversations': conversations.data})

    def post(self, request, user_id):
        # Tạo conversation mới
        title = request.data.get('title', 'New Chat')
        conversation_id = str(uuid.uuid4())
        res = supabase.table('conversations').insert({
            'id': conversation_id,
            'user_id': user_id,
            'title': title
        }).execute()
        if res.data:
            return Response({'conversation': res.data[0]}, status=201)
        return Response({'error': 'Cannot create conversation'}, status=400)

    def patch(self, request, user_id):
        # Đổi tên conversation
        conversation_id = request.data.get('conversation_id')
        title = request.data.get('title')
        if not conversation_id or not title:
            return Response({'error': 'Thiếu conversation_id hoặc title'}, status=400)
        res = supabase.table('conversations').update({'title': title}).eq('user_id', user_id).eq('id', conversation_id).execute()
        if res.data:
            return Response({'conversation': res.data[0]})
        return Response({'error': 'Không đổi tên được'}, status=400)

class ChatHistoryView(APIView):
    def get(self, request, user_id, conversation_id):
        # Lấy lịch sử trò chuyện theo conversation
        chats = supabase.table('chat_history').select('*').eq('user_id', user_id).eq('conversation_id', conversation_id).order('created_at').execute()
        return Response({'history': chats.data})

    def post(self, request, user_id, conversation_id):
        # Lưu tin nhắn mới vào lịch sử và trả về phản hồi AI
        message = request.data.get('message')
        role = request.data.get('role', 'user')
        media_url = request.data.get('media_url')
        media_type = request.data.get('media_type')
        if not message and not media_url:
            return Response({'error': 'Message or media required'}, status=status.HTTP_400_BAD_REQUEST)
        # Lưu tin nhắn user
        supabase.table('chat_history').insert({
            'user_id': user_id,
            'conversation_id': conversation_id,
            'message': message,
            'role': role,
            'media_url': media_url,
            'media_type': media_type
        }).execute()
        # Gọi AI Gemini
        ai_response = ""
        try:
            model = genai.GenerativeModel('models/gemini-1.5-flash')
            response = model.generate_content(message or "[file sent]")
            if hasattr(response, 'text') and response.text:
                ai_response = response.text.strip()
            else:
                ai_response = "Xin lỗi, tôi không thể tạo phản hồi cho tin nhắn này."
        except Exception as e:
            ai_response = f"Lỗi AI: {str(e)}"
        # Lưu phản hồi AI vào lịch sử
        supabase.table('chat_history').insert({
            'user_id': user_id,
            'conversation_id': conversation_id,
            'message': ai_response,
            'role': 'ai'
        }).execute()
        return Response({'message': 'Saved', 'ai_message': {'content': ai_response}})

    def delete(self, request, user_id, conversation_id):
        # Xoá toàn bộ lịch sử chat và conversation này
        supabase.table('chat_history').delete().eq('user_id', user_id).eq('conversation_id', conversation_id).execute()
        supabase.table('conversations').delete().eq('user_id', user_id).eq('id', conversation_id).execute()
        return Response({'message': 'Conversation and chat history deleted.'}, status=204)
