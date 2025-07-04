from django.urls import path
# Use local versions to avoid Supabase connection issues
from .auth_views_local import RegisterView, LoginView
from .chat_history_views_local import ChatHistoryView, ConversationListView
from backend.notifications_api import notifications_api
from backend.file_upload_api import upload_file
from .group_chat_views import create_room, get_room_history, list_rooms, get_room_info
from .sharing_views import share_conversation, join_shared_conversation, get_shared_conversation_info

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('conversations/<str:user_id>/', ConversationListView.as_view()),
    path('conversations/<str:user_id>/new/', ConversationListView.as_view()),
    path('history/<str:user_id>/<str:conversation_id>/', ChatHistoryView.as_view()),
    path('notifications/', notifications_api),
    path('upload/', upload_file),
    # Group chat endpoints
    path('rooms/create/', create_room),
    path('rooms/', list_rooms),
    path('rooms/<str:room_code>/history/', get_room_history),
    path('rooms/<str:room_code>/info/', get_room_info),
    # Sharing endpoints
    path('share/', share_conversation),
    path('join/', join_shared_conversation),
    path('shared/<str:room_code>/', get_shared_conversation_info),
]
# Các API khác dùng model Django đã được loại bỏ, chỉ còn API sử dụng Supabase.
