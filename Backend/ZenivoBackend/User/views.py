from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import RegisterView
from .serializers import HRUpdateEmployeeSerializer, CustomRegisterSerializer
from .permissions import IsHR
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomRegisterView(RegisterView):
    """
    Custom registration view that explicitly uses CustomRegisterSerializer
    """
    serializer_class = CustomRegisterSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        logger.debug("=== CustomRegisterView.post() called ===")
        logger.debug(f"Request data: {request.data}")
        return super().post(request, *args, **kwargs)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
  
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        })


class HRUpdateEmployeeView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def patch(self, request, user_id):
        user = User.objects.get(id=user_id)

        serializer = HRUpdateEmployeeSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Employee updated successfully"})

        return Response(serializer.errors, status=400)