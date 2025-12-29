from django.contrib import admin
from .models import Journal, JournalAnalysis

@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'mood', 'created_at')
    search_fields = ('title', 'thoughts', 'user__username')

@admin.register(JournalAnalysis)
class JournalAnalysisAdmin(admin.ModelAdmin):
    list_display = ('journal', 'sentiment_score', 'sentiment_label')
