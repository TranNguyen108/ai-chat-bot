from django.db import models  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.db.models import QuerySet  # type: ignore

class ChatSession(models.Model):
    id: int  # Type hint for auto-generated primary key
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200, default="New Chat")
    is_group_chat = models.BooleanField(default=False)  # For shared conversations
    room_code = models.CharField(max_length=6, unique=True, null=True, blank=True)  # 6-digit share code
    is_shared = models.BooleanField(default=False)  # Whether this conversation is shared
    shared_users = models.ManyToManyField(User, related_name='shared_conversations', blank=True)  # Users who joined this shared conversation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.is_shared:
            return f"Shared Chat: {self.title} ({self.room_code})"
        return f"Chat {self.id}: {self.title}"

class Message(models.Model):
    id: int  # Type hint for auto-generated primary key
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Track individual users in group chats
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        user_info = f"({self.user.username})" if self.user else ""
        return f"{self.role}{user_info}: {self.content[:50]}..."
