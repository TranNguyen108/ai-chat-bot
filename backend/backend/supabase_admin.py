from django.urls import path
from django.template.response import TemplateResponse
from django.contrib.auth import logout
from django.shortcuts import redirect

class CustomAdminSite:
    # Không kế thừa admin.AdminSite nữa, chỉ render template custom
    def get_urls(self):
        return [
            path('', self.index, name='custom-admin-index'),
            path('trang-mau-1/', self.page1, name='page1'),
            path('trang-mau-2/', self.page2, name='page2'),
            path('trang-mau-2/delete/<uuid:noti_id>/', self.delete_notification, name='delete-notification'),
            path('trang-mau-3/', self.page3, name='page3'),
            path('logout/', self.custom_logout, name='custom-logout'),
        ]

    def index(self, request):
        context = {
            'sidebar_links': [
                {'url': '/admin/trang-mau-1/', 'label': 'Trang mẫu 1'},
                {'url': '/admin/trang-mau-2/', 'label': 'Trang mẫu 2'},
                {'url': '/admin/trang-mau-3/', 'label': 'Trang mẫu 3'},
            ],
            'welcome': f"Chào mừng, {request.user.username}!"
        }
        return TemplateResponse(request, "admin/base_site.html", context)

    def page1(self, request):
        # Xử lý thêm user
        if request.method == 'POST' and 'email' in request.POST:
            email = request.POST.get('email')
            password = request.POST.get('password')
            role = request.POST.get('role', 'user')
            from backend.supabase_client import supabase
            supabase.table('users').insert({
                'email': email,
                'password_hash': password,
                'role': role
            }).execute()
        # Xử lý xoá user
        if request.method == 'POST' and request.path.startswith('/admin/trang-mau-1/delete/'):
            user_id = request.path.split('/')[-2]
            from backend.supabase_client import supabase
            supabase.table('users').delete().eq('id', user_id).execute()
        # Lấy danh sách user
        from backend.supabase_client import supabase
        users = supabase.table('users').select('*').execute().data or []
        context = {'sidebar_links': [
            {'url': '/admin/trang-mau-1/', 'label': 'Quản lý người dùng'},
            {'url': '/admin/trang-mau-2/', 'label': 'Trang mẫu 2'},
            {'url': '/admin/trang-mau-3/', 'label': 'Trang mẫu 3'},
        ], 'welcome': f"Chào mừng, {request.user.username}!", 'users': users}
        return TemplateResponse(request, "admin/page1.html", context)

    def page2(self, request):
        from backend.supabase_client import supabase
        # Gửi thông báo mới
        if request.method == 'POST' and 'message' in request.POST:
            message = request.POST.get('message')
            supabase.table('notifications').insert({
                'message': message
            }).execute()
        # Lấy danh sách thông báo
        notifications = supabase.table('notifications').select('*').order('created_at', desc=True).execute().data or []
        context = {'sidebar_links': [
            {'url': '/admin/trang-mau-1/', 'label': 'Quản lý người dùng'},
            {'url': '/admin/trang-mau-2/', 'label': 'Gửi thông báo'},
            {'url': '/admin/trang-mau-3/', 'label': 'Trang mẫu 3'},
        ], 'welcome': f"Chào mừng, {request.user.username}!", 'notifications': notifications}
        return TemplateResponse(request, "admin/page2.html", context)

    def delete_notification(self, request, noti_id):
        from backend.supabase_client import supabase
        if request.method == 'POST':
            supabase.table('notifications').delete().eq('id', str(noti_id)).execute()
        return redirect('/admin/trang-mau-2/')

    def page3(self, request):
        context = {'sidebar_links': [
            {'url': '/admin/trang-mau-1/', 'label': 'Trang mẫu 1'},
            {'url': '/admin/trang-mau-2/', 'label': 'Trang mẫu 2'},
            {'url': '/admin/trang-mau-3/', 'label': 'Trang mẫu 3'},
        ], 'welcome': f"Chào mừng, {request.user.username}!"}
        return TemplateResponse(request, "admin/page3.html", context)

    def custom_logout(self, request):
        logout(request)
        return redirect('/admin/login/')

custom_admin_site = CustomAdminSite()
