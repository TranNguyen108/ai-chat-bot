from django.urls import path
from . import views

app_name = 'chatapp'

urlpatterns = [
    path('chat/', views.ChatView.as_view(), name='chat'),
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
]
