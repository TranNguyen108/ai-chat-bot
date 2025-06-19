from django.http import JsonResponse
from backend.supabase_client import supabase
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def notifications_api(request):
    if request.method == 'GET':
        notifications = supabase.table('notifications').select('*').order('created_at', desc=True).execute().data or []
        return JsonResponse({'notifications': notifications})
    return JsonResponse({'error': 'Method not allowed'}, status=405)
