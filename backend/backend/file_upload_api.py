import os
import uuid
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

MEDIA_ROOT = os.path.join(settings.BASE_DIR, 'backend', 'media')
MEDIA_URL = '/media/'

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(MEDIA_ROOT, filename)
        os.makedirs(MEDIA_ROOT, exist_ok=True)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        file_url = MEDIA_URL + filename
        return JsonResponse({'success': True, 'file_url': file_url, 'media_type': file.content_type})
    return JsonResponse({'success': False, 'error': 'No file uploaded'}, status=400)
