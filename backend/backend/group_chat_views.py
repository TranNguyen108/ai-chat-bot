from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.views.decorators.http import require_http_methods  # type: ignore
import json
from django.contrib.auth.models import User  # type: ignore
from chat.models import ChatSession, Message
import uuid

@csrf_exempt
@require_http_methods(["POST"])
def create_room(request):
    """Create a new group chat room"""
    try:
        data = json.loads(request.body)
        title = data.get('title', 'New Group Chat')
        user_id = data.get('user_id')
        
        if not user_id:
            return JsonResponse({'error': 'User ID is required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # Generate unique room code
        room_code = str(uuid.uuid4())[:8].upper()
        
        # Create group chat session
        chat_session = ChatSession.objects.create(
            user=user,
            title=title,
            is_group_chat=True,
            room_code=room_code
        )
        
        return JsonResponse({
            'id': chat_session.id,
            'title': chat_session.title,
            'room_code': chat_session.room_code,
            'created_by': user.username,
            'created_at': chat_session.created_at.isoformat()
        })
        
    except Exception as e:
        print(f"Error creating room: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_room_history(request, room_code):
    """Get chat history for a group chat room"""
    try:
        chat_session = ChatSession.objects.get(room_code=room_code, is_group_chat=True)
        messages = Message.objects.filter(chat_session=chat_session).order_by('timestamp')
        
        messages_data = []
        for message in messages:
            messages_data.append({
                'id': message.id,
                'content': message.content,
                'role': message.role,
                'user': message.user.username if message.user else None,
                'timestamp': message.timestamp.isoformat()
            })
        
        return JsonResponse({
            'room_code': room_code,
            'title': chat_session.title,
            'messages': messages_data
        })
        
    except ChatSession.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
    except Exception as e:
        print(f"Error getting room history: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def list_rooms(request):
    """List all available group chat rooms"""
    try:
        rooms = ChatSession.objects.filter(is_group_chat=True).order_by('-updated_at')
        
        rooms_data = []
        for room in rooms:
            # Get last message for preview
            last_message = Message.objects.filter(chat_session=room).last()
            
            rooms_data.append({
                'id': room.id,
                'title': room.title,
                'room_code': room.room_code,
                'created_by': room.user.username if room.user else 'Unknown',
                'created_at': room.created_at.isoformat(),
                'updated_at': room.updated_at.isoformat(),
                'last_message': {
                    'content': last_message.content[:50] + '...' if last_message and len(last_message.content) > 50 else last_message.content if last_message else None,
                    'timestamp': last_message.timestamp.isoformat() if last_message else None
                } if last_message else None
            })
        
        return JsonResponse({'rooms': rooms_data})
        
    except Exception as e:
        print(f"Error listing rooms: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_room_info(request, room_code):
    """Get information about a specific room"""
    try:
        chat_session = ChatSession.objects.get(room_code=room_code, is_group_chat=True)
        
        # Count active users (this is simplified - in a real app you'd track WebSocket connections)
        unique_users = Message.objects.filter(chat_session=chat_session).values('user').distinct().count()
        
        return JsonResponse({
            'id': chat_session.id,
            'title': chat_session.title,
            'room_code': chat_session.room_code,
            'created_by': chat_session.user.username if chat_session.user else 'Unknown',
            'created_at': chat_session.created_at.isoformat(),
            'updated_at': chat_session.updated_at.isoformat(),
            'user_count': unique_users
        })
        
    except ChatSession.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
    except Exception as e:
        print(f"Error getting room info: {e}")
        return JsonResponse({'error': str(e)}, status=500)
