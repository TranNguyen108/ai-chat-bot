from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.views.decorators.http import require_http_methods  # type: ignore
import json
import random
import string
from django.contrib.auth.models import User  # type: ignore
from chat.models import ChatSession, Message

def generate_room_code():
    """Generate a 6-digit random room code"""
    return ''.join(random.choices(string.digits, k=6))

@csrf_exempt
@require_http_methods(["POST"])
def share_conversation(request):
    """Share an existing conversation and generate a room code"""
    try:
        data = json.loads(request.body)
        conversation_id = data.get('conversation_id')
        user_id = data.get('user_id')
        
        if not conversation_id or not user_id:
            return JsonResponse({'error': 'Conversation ID and User ID are required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            conversation = ChatSession.objects.get(id=conversation_id, user=user)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except ChatSession.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found or access denied'}, status=404)
        except ValueError as e:
            return JsonResponse({'error': f'Invalid ID format: {e}'}, status=400)
        
        # If already shared, return existing code
        if conversation.is_shared and conversation.room_code:
            return JsonResponse({
                'room_code': conversation.room_code,
                'message': 'Conversation is already shared'
            })
        
        # Generate unique room code
        room_code = generate_room_code()
        while ChatSession.objects.filter(room_code=room_code).exists():
            room_code = generate_room_code()
        
        # Update conversation to shared
        conversation.is_shared = True
        conversation.room_code = room_code
        conversation.save()
        
        return JsonResponse({
            'room_code': room_code,
            'message': 'Conversation shared successfully'
        })
        
    except Exception as e:
        print(f"Error sharing conversation: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def join_shared_conversation(request):
    """Join a shared conversation using room code"""
    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")  # Debug logging
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
            
        print(f"Join request data: {data}")  # Debug logging
        
        room_code = data.get('room_code')
        user_id = data.get('user_id')
        
        print(f"Parsed: room_code={room_code}, user_id={user_id}")  # Debug logging
        
        if not room_code or not user_id:
            print("Missing room_code or user_id")  # Debug logging
            return JsonResponse({'error': 'Room code and User ID are required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            conversation = ChatSession.objects.get(room_code=room_code, is_shared=True)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except ChatSession.DoesNotExist:
            return JsonResponse({'error': 'Shared conversation not found'}, status=404)
        
        # Add user to shared_users if not already added
        if not conversation.shared_users.filter(id=user.id).exists():
            conversation.shared_users.add(user)
        
        # Get conversation history with user names
        messages = Message.objects.filter(chat_session=conversation).order_by('timestamp')
        messages_data = []
        
        for message in messages:
            messages_data.append({
                'id': message.id,
                'content': message.content,
                'role': message.role,
                'user_name': message.user.username if message.user else 'System',
                'timestamp': message.timestamp.isoformat()
            })
        
        return JsonResponse({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'room_code': conversation.room_code,
            'messages': messages_data,
            'participants': [u.username for u in conversation.shared_users.all()],
            'owner': conversation.user.username if conversation.user else 'System'
        })
        
    except Exception as e:
        print(f"Error joining shared conversation: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_shared_conversation_info(request, room_code):
    """Get information about a shared conversation"""
    try:
        conversation = ChatSession.objects.get(room_code=room_code, is_shared=True)
        
        return JsonResponse({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'room_code': conversation.room_code,
            'owner': conversation.user.username if conversation.user else 'System',
            'participants': [u.username for u in conversation.shared_users.all()],
            'created_at': conversation.created_at.isoformat(),
            'updated_at': conversation.updated_at.isoformat()
        })
        
    except ChatSession.DoesNotExist:
        return JsonResponse({'error': 'Shared conversation not found'}, status=404)
    except Exception as e:
        print(f"Error getting shared conversation info: {e}")
        return JsonResponse({'error': str(e)}, status=500)
