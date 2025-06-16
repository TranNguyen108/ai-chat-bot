from django.db import models  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.db.models import QuerySet  # type: ignore

class ChatConversation(models.Model):
    id: int  # Type hint for auto-generated primary key
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.created_at}"

    class Meta:
        ordering = ['-updated_at']

class ChatMessage(models.Model):
    id: int  # Type hint for auto-generated primary key
    MESSAGE_TYPES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

    class Meta:
        ordering = ['timestamp']
