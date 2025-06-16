from django.contrib import admin  # type: ignore
from .models import ChatConversation, ChatMessage

@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title']
    date_hierarchy = 'created_at'

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'message_type', 'content_preview', 'timestamp']
    list_filter = ['message_type', 'timestamp']
    search_fields = ['content']
    date_hierarchy = 'timestamp'
    
    def content_preview(self, obj):
        """Display a preview of the message content"""
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    
    # Django admin method attribute - suppress Pylance warning
    content_preview.short_description = 'Content Preview'  # type: ignore
