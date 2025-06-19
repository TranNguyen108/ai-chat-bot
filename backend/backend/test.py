import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

import google.generativeai as genai
from django.conf import settings
genai.configure(api_key=getattr(settings, 'GEMINI_API_KEY', None))
print([m.name for m in genai.list_models()])