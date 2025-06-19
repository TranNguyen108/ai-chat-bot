from django.urls import path
from .auth_views import RegisterView, LoginView
from .chat_history_views import ChatHistoryView, ConversationListView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('conversations/<str:user_id>/', ConversationListView.as_view()),
    path('conversations/<str:user_id>/new/', ConversationListView.as_view()),
    path('history/<str:user_id>/<str:conversation_id>/', ChatHistoryView.as_view()),
]
# Các API khác dùng model Django đã được loại bỏ, chỉ còn API sử dụng Supabase.
