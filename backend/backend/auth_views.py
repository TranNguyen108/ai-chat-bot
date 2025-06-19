from django.contrib.auth.hashers import make_password, check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .supabase_client import supabase

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'user')
        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
        # Check if user exists
        existing = supabase.table('users').select('id').eq('email', email).execute()
        if existing.data:
            return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
        hashed_pw = make_password(password)
        user = supabase.table('users').insert({
            'email': email,
            'password_hash': hashed_pw,
            'role': role
        }).execute()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = supabase.table('users').select('*').eq('email', email).single().execute()
        if not user.data or not check_password(password, user.data['password_hash']):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'message': 'Login successful', 'role': user.data['role'], 'user_id': user.data['id']})
