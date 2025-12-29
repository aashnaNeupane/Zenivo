from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=['HR', 'EMPLOYEE'])

    def save(self, request):
        user = super().save(request)
        user.role = self.data.get('role')
        user.save()
        return user
