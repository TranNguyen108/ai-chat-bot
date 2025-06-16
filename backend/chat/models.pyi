# Django model stubs for better type checking
from typing import Any, Optional
from django.db.models import Model, QuerySet
from django.contrib.auth.models import User

class ChatSession(Model):
    id: int
    user: Optional[User]
    title: str
    created_at: Any
    updated_at: Any
    messages: QuerySet["Message"]

class Message(Model):
    id: int
    chat_session: ChatSession
    role: str
    content: str
    timestamp: Any
