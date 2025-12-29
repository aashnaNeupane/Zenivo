from rest_framework.views import APIView
from rest_framework.response import Response
from User.permissions import IsHR, IsEmployee
from rest_framework.permissions import IsAuthenticated


class HRDashboard(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        user = request.user
        return Response({
            "dashboard_type": user.role.lower(),   
            "role": user.role,                     
            "username": user.username,
            "email": user.email
        })


class EmployeeDashboard(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        user = request.user
        return Response({
            "dashboard_type": user.role.lower(),   
            "role": user.role,                     
            "username": user.username,
            "email": user.email
        })
