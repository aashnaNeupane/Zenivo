# journal/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers

# Serializer without a model
class JournalSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    thoughts = serializers.CharField()
    mood = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField(), required=False)

    def create(self, validated_data):
        # Since no model, just return the data
        return validated_data


class JournalCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def post(self, request, *args, **kwargs):
        serializer = JournalSerializer(data=request.data)
        if serializer.is_valid():
            journal = serializer.save()  # Calls create(), returns validated_data
            # You can add extra info like user ID
            journal['user'] = request.user.username
            return Response(journal, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    