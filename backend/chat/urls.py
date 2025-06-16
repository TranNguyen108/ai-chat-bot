from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.send_message, name='send_message'),
    path('history/<int:session_id>/', views.get_chat_history, name='get_chat_history'),
    path('sessions/', views.get_all_sessions, name='get_all_sessions'),
]
