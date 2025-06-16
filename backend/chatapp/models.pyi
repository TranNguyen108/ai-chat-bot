# Django model stubs for better type checking
from typing import Any, Optional
from django.db.models import Model, QuerySet
from django.contrib.auth.models import User

class ChatConversation(Model):
    id: int
    user: Optional[User]
    title: str
    created_at: Any
    updated_at: Any
    messages: QuerySet["ChatMessage"]

class ChatMessage(Model):
    id: int
    conversation: ChatConversation
    message_type: str
    content: str
    timestamp: Any
