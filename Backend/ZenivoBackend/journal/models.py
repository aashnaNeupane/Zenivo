from django.db import models
from django.conf import settings

class Journal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journals')
    title = models.CharField(max_length=255)
    thoughts = models.TextField()
    mood = models.CharField(max_length=50)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class JournalAnalysis(models.Model):
    journal = models.OneToOneField(Journal, on_delete=models.CASCADE, related_name='analysis')
    sentiment_score = models.FloatField(help_text="Score between -1 (negative) and 1 (positive)")
    sentiment_label = models.CharField(max_length=50, help_text="e.g., Positive, Neutral, Negative")
    analysis_summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for Journal {self.journal.id}"
