from django.db import models  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.db.models import QuerySet  # type: ignore

class ChatSession(models.Model):
    id: int  # Type hint for auto-generated primary key
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat {self.id}: {self.title}"

class Message(models.Model):
    id: int  # Type hint for auto-generated primary key
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
