from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from chat.models import ChatSession, Message
import google.generativeai as genai
from django.conf import settings
import uuid

genai.configure(api_key=getattr(settings, 'GEMINI_API_KEY', None))

class ConversationListView(APIView):
    def get(self, request, user_id):
        # Lấy danh sách conversation của user (bao gồm cả shared conversations)
        try:
            # Validate user_id format
            if user_id == 'undefined' or not user_id.isdigit():
                return Response({'error': 'Invalid user ID format'}, status=400)
                
            user = User.objects.get(id=user_id)
            # Get own conversations + shared conversations
            own_conversations = ChatSession.objects.filter(user=user)
            shared_conversations = ChatSession.objects.filter(shared_users=user)
            
            # Combine and remove duplicates, then order by updated_at
            all_conversations = (own_conversations | shared_conversations).distinct().order_by('-updated_at')
            
            data = []
            for conv in all_conversations:
                data.append({
                    'id': str(conv.id),
                    'user_id': str(conv.user.id) if conv.user else None,
                    'title': conv.title,
                    'created_at': conv.created_at.isoformat(),
                    'is_shared': conv.is_shared,
                    'room_code': conv.room_code,
                    'is_owner': conv.user == user,
                    'participants': [u.username for u in conv.shared_users.all()] if conv.is_shared else []
                })
            return Response({'conversations': data})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def post(self, request, user_id):
        # Tạo conversation mới
        try:
            # Validate user_id format
            if user_id == 'undefined' or not user_id.isdigit():
                return Response({'error': 'Invalid user ID format'}, status=400)
                
            user = User.objects.get(id=user_id)
            title = request.data.get('title', 'New Chat')
            conversation = ChatSession.objects.create(user=user, title=title)
            return Response({
                'conversation': {
                    'id': str(conversation.id),
                    'user_id': str(conversation.user.id),
                    'title': conversation.title,
                    'created_at': conversation.created_at.isoformat()
                }
            }, status=201)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def patch(self, request, user_id):
        # Đổi tên conversation
        # Validate user_id format
        if user_id == 'undefined' or not user_id.isdigit():
            return Response({'error': 'Invalid user ID format'}, status=400)
            
        conversation_id = request.data.get('conversation_id')
        title = request.data.get('title')
        if not conversation_id or not title:
            return Response({'error': 'Thiếu conversation_id hoặc title'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            conversation = ChatSession.objects.get(id=conversation_id, user=user)
            conversation.title = title
            conversation.save()
            return Response({
                'conversation': {
                    'id': str(conversation.id),
                    'user_id': str(conversation.user.id),
                    'title': conversation.title,
                    'created_at': conversation.created_at.isoformat()
                }
            })
        except (User.DoesNotExist, ChatSession.DoesNotExist):
            return Response({'error': 'Không đổi tên được'}, status=400)

class ChatHistoryView(APIView):
    def get(self, request, user_id, conversation_id):
        # Lấy lịch sử trò chuyện theo conversation (support shared conversations)
        try:
            user = User.objects.get(id=user_id)
            # Check if user owns this conversation or is a shared participant
            try:
                conversation = ChatSession.objects.get(id=conversation_id, user=user)
            except ChatSession.DoesNotExist:
                # Check if user is a participant in shared conversation
                conversation = ChatSession.objects.get(id=conversation_id, shared_users=user)
            
            messages = Message.objects.filter(chat_session=conversation).order_by('timestamp')
            
            history = []
            for msg in messages:
                history.append({
                    'id': msg.id,
                    'user_id': str(msg.chat_session.user.id) if msg.chat_session.user else None,
                    'conversation_id': str(msg.chat_session.id),
                    'message': msg.content,
                    'role': 'ai' if msg.role == 'assistant' else msg.role,
                    'user_name': msg.user.username if msg.user else 'System',
                    'created_at': msg.timestamp.isoformat()
                })
            
            return Response({'history': history})
        except (User.DoesNotExist, ChatSession.DoesNotExist):
            return Response({'error': 'Not found'}, status=404)

    def post(self, request, user_id, conversation_id):
        # Lưu tin nhắn mới vào lịch sử và trả về phản hồi AI
        message = request.data.get('message')
        role = request.data.get('role', 'user')
        
        if not message:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            try:
                conversation = ChatSession.objects.get(id=conversation_id, user=user)
            except ChatSession.DoesNotExist:
                # Check if user is a participant in shared conversation
                conversation = ChatSession.objects.get(id=conversation_id, shared_users=user)
            
            # Lưu tin nhắn user với thông tin user
            Message.objects.create(
                chat_session=conversation,
                user=user,  # Save which user sent the message
                role=role,
                content=message
            )
            
            # Lấy lịch sử hội thoại để AI có context
            previous_messages = Message.objects.filter(
                chat_session=conversation
            ).order_by('timestamp')
            
            # Chuyển QuerySet thành list để có thể sử dụng negative indexing
            all_messages = list(previous_messages)
            
            # Tạo conversation history cho Gemini Chat (không bao gồm tin nhắn vừa lưu)
            chat_history = []
            if len(all_messages) > 1:  # Nếu có nhiều hơn 1 tin nhắn
                for msg in all_messages[:-1]:  # Bỏ tin nhắn cuối (vừa lưu)
                    if msg.role == 'user':
                        chat_history.append({
                            "role": "user",
                            "parts": [msg.content]
                        })
                    elif msg.role == 'assistant':
                        chat_history.append({
                            "role": "model", 
                            "parts": [msg.content]
                        })
            
            # Gọi AI Gemini với conversation context
            ai_response = ""
            try:
                if settings.GEMINI_API_KEY:
                    model = genai.GenerativeModel('models/gemini-1.5-flash')
                    
                    # Khởi tạo chat với lịch sử nếu có
                    if chat_history:
                        # Chỉ lấy 10 cặp hội thoại gần nhất để tránh token limit
                        recent_history = chat_history[-20:] if len(chat_history) > 20 else chat_history
                        chat = model.start_chat(history=recent_history)
                        response = chat.send_message(message)
                    else:
                        # Nếu là tin nhắn đầu tiên
                        system_prompt = "Bạn là một AI assistant thông minh, hữu ích và thân thiện. Hãy trả lời bằng tiếng Việt một cách tự nhiên."
                        chat = model.start_chat()
                        response = chat.send_message(f"{system_prompt}\n\nNgười dùng: {message}")
                    
                    if hasattr(response, 'text') and response.text:
                        ai_response = response.text.strip()
                    else:
                        ai_response = "Xin lỗi, tôi không thể tạo phản hồi cho tin nhắn này."
                else:
                    ai_response = "AI API key not configured. This is a test response."
            except Exception as e:
                print(f"AI Error: {str(e)}")  # Debug log
                ai_response = f"Lỗi AI: {str(e)}"
            
            # Lưu phản hồi AI vào lịch sử (không ghi user cho AI)
            Message.objects.create(
                chat_session=conversation,
                role='assistant',
                content=ai_response
            )
            
            return Response({'message': 'Saved', 'ai_message': {'content': ai_response}})
            
        except (User.DoesNotExist, ChatSession.DoesNotExist):
            return Response({'error': 'Not found'}, status=404)

    def delete(self, request, user_id, conversation_id):
        # Xoá toàn bộ lịch sử chat và conversation này
        try:
            user = User.objects.get(id=user_id)
            
            # Try to get conversation owned by user first
            try:
                conversation = ChatSession.objects.get(id=conversation_id, user=user)
                # User owns this conversation - delete completely
                conversation.delete()
                return Response({'message': 'Conversation and chat history deleted.'}, status=204)
            except ChatSession.DoesNotExist:
                # Check if this is a shared conversation
                try:
                    conversation = ChatSession.objects.get(id=conversation_id)
                    if user in conversation.shared_users.all():
                        # User is participant - remove from shared_users
                        conversation.shared_users.remove(user)
                        return Response({'message': 'Removed from shared conversation.'}, status=204)
                    else:
                        # User has no access to this conversation
                        return Response({'error': 'Not found'}, status=404)
                except ChatSession.DoesNotExist:
                    return Response({'error': 'Not found'}, status=404)
                    
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)