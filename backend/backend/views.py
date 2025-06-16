from django.http import JsonResponse
from django.shortcuts import render
from django.views import View

class HomeView(View):
    def get(self, request):
        # Nếu request từ browser, trả về HTML
        if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
            return render(request, 'home.html')
        
        # Nếu request từ API, trả về JSON
        return JsonResponse({
            'message': 'Chat AI Backend API',
            'version': '1.0.0',
            'endpoints': {
                'admin': '/admin/',
                'chat': '/api/chat/',
                'conversations': '/api/conversations/',
                'conversation_detail': '/api/conversations/{id}/'
            },
            'frontend_url': 'http://localhost:5174/',
            'status': 'running'
        })
