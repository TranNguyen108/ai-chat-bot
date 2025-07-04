import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatSession, Message
import google.generativeai as genai
from django.conf import settings

# Configure Gemini
genai.configure(api_key=getattr(settings, 'GEMINI_API_KEY', None))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify room that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'message': f'User joined room {self.room_name}'
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            user_id = text_data_json.get('user_id')
            message_type = text_data_json.get('type', 'user')
            
            if message_type == 'user':
                # Save user message to database
                await self.save_message(user_id, self.room_name, message, 'user')
                
                # Broadcast user message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'user_id': user_id,
                        'message_type': 'user',
                        'timestamp': await self.get_timestamp()
                    }
                )
                
                # Generate AI response
                ai_response = await self.get_ai_response(self.room_name, message)
                
                # Save AI message to database
                await self.save_message(user_id, self.room_name, ai_response, 'assistant')
                
                # Broadcast AI response to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': ai_response,
                        'user_id': 'ai',
                        'message_type': 'ai',
                        'timestamp': await self.get_timestamp()
                    }
                )
                
        except Exception as e:
            print(f"Error in receive: {str(e)}")

    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']
        message_type = event['message_type']
        timestamp = event['timestamp']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user_id': user_id,
            'type': message_type,
            'timestamp': timestamp
        }))

    async def user_joined(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'system',
            'message': message
        }))

    @database_sync_to_async
    def save_message(self, user_id, room_name, message, role):
        try:
            user = User.objects.get(id=user_id) if user_id != 'ai' else None
            # Get or create room session
            room_session, created = ChatSession.objects.get_or_create(
                title=f"Room: {room_name}",
                defaults={'user': user}
            )
            
            # Save message
            Message.objects.create(
                chat_session=room_session,
                role=role,
                content=message
            )
        except Exception as e:
            print(f"Error saving message: {str(e)}")

    @database_sync_to_async
    def get_room_history(self, room_name):
        try:
            room_session = ChatSession.objects.filter(title=f"Room: {room_name}").first()
            if room_session:
                messages = Message.objects.filter(chat_session=room_session).order_by('timestamp')
                return list(messages)
            return []
        except Exception as e:
            print(f"Error getting room history: {str(e)}")
            return []

    async def get_ai_response(self, room_name, user_message):
        try:
            if not settings.GEMINI_API_KEY:
                return "AI is not configured for this room."
            
            # Get recent room history for context
            room_messages = await self.get_room_history(room_name)
            
            # Build conversation context
            chat_history = []
            for msg in room_messages[-10:]:  # Last 10 messages for context
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

            # Generate AI response
            model = genai.GenerativeModel('models/gemini-1.5-flash')
            
            if chat_history:
                chat = model.start_chat(history=chat_history)
                response = chat.send_message(user_message)
            else:
                system_prompt = f"Bạn là AI assistant trong phòng chat '{room_name}'. Hãy trả lời thân thiện bằng tiếng Việt."
                chat = model.start_chat()
                response = chat.send_message(f"{system_prompt}\n\nUser: {user_message}")
            
            if hasattr(response, 'text') and response.text:
                return response.text.strip()
            else:
                return "Xin lỗi, tôi không thể tạo phản hồi lúc này."
                
        except Exception as e:
            print(f"AI Error: {str(e)}")
            return f"Lỗi AI: {str(e)}"

    @database_sync_to_async 
    def get_timestamp(self):
        from django.utils import timezone
        return timezone.now().isoformat()


class RoomListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'room_list'
        
        # Join room list group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room list group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        
        if action == 'get_rooms':
            rooms = await self.get_active_rooms()
            await self.send(text_data=json.dumps({
                'type': 'room_list',
                'rooms': rooms
            }))

    @database_sync_to_async
    def get_active_rooms(self):
        # Get list of active group chat rooms
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
        
        return rooms_data
