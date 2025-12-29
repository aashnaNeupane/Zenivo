from django.urls import path
from .views import JournalCreateView

urlpatterns = [
    path('create/', JournalCreateView.as_view(), name='create_journal'),
]
