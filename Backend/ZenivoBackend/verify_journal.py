import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ZenivoBackend.settings")
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from journal.models import Journal, JournalAnalysis

User = get_user_model()

def run_verification():
    print("Starting verification...")

    # 1. Create a transient test user
    username = "verify_user_123"
    email = "verify@example.com"
    password = "password123"
    
    user, created = User.objects.get_or_create(username=username, email=email)
    if created:
        user.set_password(password)
        user.save()
        print(f"Created test user: {username}")
    else:
        print(f"Using existing test user: {username}")

    # 2. Setup Client
    client = APIClient()
    client.force_authenticate(user=user)

    # 3. Test Journal Creation
    print("\nTesting Journal Creation with Sentiment Analysis...")
    url = "/api/journal/create/"
    data = {
        "title": "My Great Day",
        "thoughts": "I am feeling absolutely wonderful today! The sun is shining and I accomplished a lot.",
        "mood": "Happy",
        "tags": ["success", "sunshine"]
    }

    response = client.post(url, data, format='json')

    if response.status_code == 201:
        print("SUCCESS: Journal created via API.")
        
        # Check Response for analysis fields
        resp_data = response.json()
        analysis = resp_data.get('analysis')
        if analysis:
            print(f"Analysis in response: {analysis}")
        else:
            print("WARNING: 'analysis' field missing in response.")

        # Check Database
        latest_journal = Journal.objects.filter(user=user).last()
        if latest_journal and hasattr(latest_journal, 'analysis'):
            print(f"Database Verification: Journal '{latest_journal.title}' has analysis.")
            print(f"Sentiment Label: {latest_journal.analysis.sentiment_label}")
            print(f"Sentiment Score: {latest_journal.analysis.sentiment_score}")
            print(f"Summary: {latest_journal.analysis.analysis_summary}")
        else:
            print("FAILURE: Journal analysis not found in database.")
            
    else:
        print(f"FAILURE: API returned {response.status_code}")
        print(response.data)

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Verification script failed with error: {e}")
