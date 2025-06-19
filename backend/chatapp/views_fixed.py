import os
import google.generativeai as genai  # type: ignore
from django.conf import settings  # type: ignore
from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.views.decorators.http import require_http_methods  # type: ignore
from django.utils.decorators import method_decorator  # type: ignore
from django.views import View  # type: ignore
import json
import logging
from .models import ChatConversation, ChatMessage

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini AI
genai.configure(api_key=settings.GEMINI_API_KEY)

@method_decorator(csrf_exempt, name='dispatch')
class ChatView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            message = data.get('message', '')
            conversation_id = data.get('conversation_id')
            
            if not message:
                return JsonResponse({'error': 'Message is required'}, status=400)
            
            # Get or create conversation
            if conversation_id:
                try:
                    conversation = ChatConversation.objects.get(id=conversation_id)
                except ChatConversation.DoesNotExist:
                    conversation = ChatConversation.objects.create(title=message[:50])
            else:
                conversation = ChatConversation.objects.create(title=message[:50])
            
            # Save user message
            user_message = ChatMessage.objects.create(
                conversation=conversation,
                message_type='user',
                content=message
            )
            
            # Generate AI response using Gemini
            try:
                model = genai.GenerativeModel('models/gemini-1.5-flash')
                response = model.generate_content(message)
                
                # Check if response has text
                if hasattr(response, 'text') and response.text:
                    ai_response = response.text
                else:
                    ai_response = "Xin lỗi, tôi không thể tạo phản hồi cho tin nhắn này."
                
            except Exception as e:
                logger.error(f"AI service error: {str(e)}")
                ai_response = f"Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu: {str(e)}"
            
            # Save AI response
            ai_message = ChatMessage.objects.create(
                conversation=conversation,
                message_type='ai',
                content=ai_response
            )
            
            return JsonResponse({
                'conversation_id': conversation.id,
                'user_message': {
                    'id': user_message.id,
                    'content': user_message.content,
                    'timestamp': user_message.timestamp.isoformat(),
                    'type': 'user'
                },
                'ai_message': {
                    'id': ai_message.id,
                    'content': ai_message.content,
                    'timestamp': ai_message.timestamp.isoformat(),
                    'type': 'ai'
                }
            })
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"General error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ConversationListView(View):
    def get(self, request):
        conversations = ChatConversation.objects.all()[:20]  # Latest 20 conversations
        conversation_data = []
        
        for conv in conversations:
            last_message = conv.messages.last()
            conversation_data.append({
                'id': conv.id,
                'title': conv.title,
                'created_at': conv.created_at.isoformat(),
                'updated_at': conv.updated_at.isoformat(),
                'last_message': last_message.content[:100] if last_message else None
            })
        
        return JsonResponse({'conversations': conversation_data})

@method_decorator(csrf_exempt, name='dispatch')
class ConversationDetailView(View):
    def get(self, request, conversation_id):
        try:
            conversation = ChatConversation.objects.get(id=conversation_id)
            messages = conversation.messages.all()
            
            messages_data = []
            for msg in messages:
                messages_data.append({
                    'id': msg.id,
                    'content': msg.content,
                    'type': msg.message_type,
                    'timestamp': msg.timestamp.isoformat()
                })
            
            return JsonResponse({
                'conversation': {
                    'id': conversation.id,
                    'title': conversation.title,
                    'created_at': conversation.created_at.isoformat(),
                    'messages': messages_data
                }
            })
            
        except ChatConversation.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found'}, status=404)
