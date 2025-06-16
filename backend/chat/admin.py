from django.contrib import admin  # type: ignore
from django.utils.html import format_html  # type: ignore
from .models import ChatSession, Message

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat_session', 'role', 'content_preview', 'timestamp']
    list_filter = ['role', 'timestamp']
    search_fields = ['content', 'chat_session__title']
    readonly_fields = ['timestamp']
    
    def content_preview(self, obj):
        """Display a preview of the message content"""
        if len(obj.content) > 100:
            return obj.content[:100] + "..."
        return obj.content
    
    # Django admin method attribute - suppress Pylance warning
    content_preview.short_description = "Content Preview"  # type: ignore
