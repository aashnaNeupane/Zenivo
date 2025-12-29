
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ZenivoBackend.settings')
django.setup()

from User.models import User

print(f"{'Username':<20} | {'Role':<10} | {'Is Active':<10}")
print("-" * 45)
for user in User.objects.all():
    print(f"{user.username:<20} | {user.role:<10} | {user.is_active:<10}")
