from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('HR', 'HR'),
        ('EMPLOYEE', 'Employee'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')

    phone_number = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )

    date_of_birth = models.DateField(null=True, blank=True)
    joined_date = models.DateField(null=True, blank=True)

    position = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
