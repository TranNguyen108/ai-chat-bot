from rest_framework import serializers
from .models import ChatConversation, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'message_type', 'timestamp']

class ChatConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages', 'message_count']
    
    def get_message_count(self, obj):
        return obj.messages.count()

class ConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'last_message', 'message_count']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        return last_msg.content[:100] if last_msg else None
    
    def get_message_count(self, obj):
        return obj.messages.count()
