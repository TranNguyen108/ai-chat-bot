import json
import google.generativeai as genai
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import ChatSession, Message

# Cấu hình Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    try:
        data = json.loads(request.body)
        message_content = data.get('message', '')
        session_id = data.get('session_id', None)
        
        if not message_content:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Tạo hoặc lấy chat session
        if session_id:
            try:
                chat_session = ChatSession.objects.get(id=session_id)
            except ChatSession.DoesNotExist:
                chat_session = ChatSession.objects.create()
        else:
            chat_session = ChatSession.objects.create()
        
        # Lưu tin nhắn của user
        user_message = Message.objects.create(
            chat_session=chat_session,
            role='user',
            content=message_content
        )
        
        # Gửi tới Gemini API
        try:
            response = model.generate_content(message_content)
            ai_response = response.text
        except Exception as e:
            ai_response = f"Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn: {str(e)}"
        
        # Lưu phản hồi của AI
        ai_message = Message.objects.create(
            chat_session=chat_session,
            role='assistant',
            content=ai_response
        )
        
        return JsonResponse({
            'success': True,
            'session_id': chat_session.id,
            'user_message': {
                'id': user_message.id,
                'content': user_message.content,
                'timestamp': user_message.timestamp.isoformat()
            },
            'ai_response': {
                'id': ai_message.id,
                'content': ai_message.content,
                'timestamp': ai_message.timestamp.isoformat()
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_chat_history(request, session_id):
    try:
        chat_session = ChatSession.objects.get(id=session_id)
        messages = chat_session.messages.all()
        
        message_list = []
        for message in messages:
            message_list.append({
                'id': message.id,
                'role': message.role,
                'content': message.content,
                'timestamp': message.timestamp.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'session_id': chat_session.id,
            'messages': message_list
        })
        
    except ChatSession.DoesNotExist:
        return JsonResponse({'error': 'Chat session not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_all_sessions(request):
    try:
        sessions = ChatSession.objects.all().order_by('-updated_at')
        session_list = []
        
        for session in sessions:
            # Lấy tin nhắn đầu tiên để làm title
            first_message = session.messages.filter(role='user').first()
            title = first_message.content[:50] + "..." if first_message and len(first_message.content) > 50 else (first_message.content if first_message else "New Chat")
            
            session_list.append({
                'id': session.id,
                'title': title,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'message_count': session.messages.count()
            })
        
        return JsonResponse({
            'success': True,
            'sessions': session_list
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
