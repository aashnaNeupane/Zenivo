from rest_framework import serializers
from .models import Journal, JournalAnalysis

class JournalAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalAnalysis
        fields = ['sentiment_score', 'sentiment_label', 'analysis_summary', 'created_at']

class JournalSerializer(serializers.ModelSerializer):
    analysis = JournalAnalysisSerializer(read_only=True)
    
    class Meta:
        model = Journal
        fields = ['id', 'user', 'title', 'thoughts', 'mood', 'tags', 'created_at', 'analysis']
        read_only_fields = ['user', 'created_at', 'analysis']

    def create(self, validated_data):
        # User is handled in the view usually, but we can double check
        return super().create(validated_data)
