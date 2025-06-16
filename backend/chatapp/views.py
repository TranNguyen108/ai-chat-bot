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
            )            # Generate AI response using Gemini
            try:
                # Use Gemini 2.0 Flash - latest stable model
                model = genai.GenerativeModel('gemini-2.0-flash-exp')
                
                # Validate API key
                if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == 'your_gemini_api_key_here':
                    ai_response = "Chưa cấu hình API key Gemini. Vui lòng kiểm tra file .env"
                    logger.error("Gemini API key not configured")
                else:
                    # Generate content with better error handling
                    response = model.generate_content(message)
                    
                    # Check if response has text and is not blocked
                    if hasattr(response, 'text') and response.text:
                        ai_response = response.text.strip()
                    elif hasattr(response, 'prompt_feedback'):
                        # Handle blocked content
                        if response.prompt_feedback.block_reason:
                            ai_response = "Tin nhắn này có thể vi phạm chính sách bảo mật của AI. Vui lòng thử lại với nội dung khác."
                        else:
                            ai_response = "Tôi không thể tạo phản hồi cho tin nhắn này. Vui lòng thử lại."
                    else:
                        ai_response = "Tôi không thể tạo phản hồi cho tin nhắn này. Vui lòng thử lại."
                    
                    logger.info(f"AI response generated successfully for conversation {conversation.id}")
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"AI service error: {error_msg}")
                
                # Provide more specific error messages
                if "PERMISSION_DENIED" in error_msg:
                    ai_response = "API key không hợp lệ hoặc hết hạn. Vui lòng kiểm tra cấu hình."
                elif "QUOTA_EXCEEDED" in error_msg:
                    ai_response = "Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau."
                elif "INVALID_ARGUMENT" in error_msg:
                    ai_response = "Tin nhắn không hợp lệ. Vui lòng thử lại với nội dung khác."
                else:
                    ai_response = "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau."
            
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
                }            })
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            return JsonResponse({'error': 'Dữ liệu không hợp lệ. Vui lòng thử lại.'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in ChatView: {str(e)}")
            return JsonResponse({
                'error': 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
                'details': str(e) if settings.DEBUG else None
            }, status=500)

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
