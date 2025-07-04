from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.views.decorators.http import require_http_methods  # type: ignore
import json
import random
import string
from django.contrib.auth.models import User  # type: ignore
from chat.models import ChatSession, Message

@csrf_exempt
@require_http_methods(["POST"])
def generate_share_code(request):
    """Generate a 6-digit share code for an existing conversation"""
    try:
        data = json.loads(request.body)
        conversation_id = data.get('conversation_id')
        user_id = data.get('user_id')
        
        if not conversation_id or not user_id:
            return JsonResponse({'error': 'conversation_id and user_id are required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            chat_session = ChatSession.objects.get(id=conversation_id)
            
            # Check if user owns this conversation
            if chat_session.user != user:
                return JsonResponse({'error': 'You can only share your own conversations'}, status=403)
            
            # Generate 6-digit room code if not exists
            if not chat_session.room_code:
                while True:
                    room_code = ''.join(random.choices(string.digits, k=6))
                    if not ChatSession.objects.filter(room_code=room_code).exists():
                        break
                
                chat_session.room_code = room_code
                chat_session.is_group_chat = True
                chat_session.save()
            
            return JsonResponse({
                'room_code': chat_session.room_code,
                'conversation_id': chat_session.id,
                'title': chat_session.title
            })
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except ChatSession.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found'}, status=404)
            
    except Exception as e:
        print(f"Error generating share code: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def join_conversation(request):
    """Join an existing conversation using room code"""
    try:
        data = json.loads(request.body)
        room_code = data.get('room_code')
        user_id = data.get('user_id')
        
        if not room_code or not user_id:
            return JsonResponse({'error': 'room_code and user_id are required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            chat_session = ChatSession.objects.get(room_code=room_code, is_group_chat=True)
            
            # Get conversation history with user info
            messages = Message.objects.filter(chat_session=chat_session).order_by('timestamp')
            
            messages_data = []
            for message in messages:
                messages_data.append({
                    'id': message.id,
                    'content': message.content,
                    'role': message.role,
                    'user': message.user.username if message.user else 'AI',
                    'timestamp': message.timestamp.isoformat()
                })
            
            return JsonResponse({
                'conversation_id': chat_session.id,
                'title': chat_session.title,
                'room_code': chat_session.room_code,
                'is_group_chat': chat_session.is_group_chat,
                'created_by': chat_session.user.username if chat_session.user else 'Unknown',
                'messages': messages_data
            })
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except ChatSession.DoesNotExist:
            return JsonResponse({'error': 'Room not found or not shareable'}, status=404)
            
    except Exception as e:
        print(f"Error joining conversation: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_conversation_info(request, conversation_id):
    """Get detailed info about a conversation including share status"""
    try:
        chat_session = ChatSession.objects.get(id=conversation_id)
        
        return JsonResponse({
            'id': chat_session.id,
            'title': chat_session.title,
            'is_group_chat': chat_session.is_group_chat,
            'room_code': chat_session.room_code,
            'created_by': chat_session.user.username if chat_session.user else 'Unknown',
            'created_at': chat_session.created_at.isoformat(),
            'updated_at': chat_session.updated_at.isoformat()
        })
        
    except ChatSession.DoesNotExist:
        return JsonResponse({'error': 'Conversation not found'}, status=404)
    except Exception as e:
        print(f"Error getting conversation info: {e}")
        return JsonResponse({'error': str(e)}, status=500)
