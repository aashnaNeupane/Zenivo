from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(required=True)

    
    
    def is_valid(self, raise_exception=False):
        logger.debug("=== CustomRegisterSerializer.is_valid() called ===")
        logger.debug(f"Initial data: {self.initial_data}")
        result = super().is_valid(raise_exception=raise_exception)
        logger.debug(f"Validation result: {result}")
        if hasattr(self, 'validated_data'):
            logger.debug(f"Validated data keys: {list(self.validated_data.keys())}")
            logger.debug(f"Validated data: {self.validated_data}")
        return result

    # 📱 Phone number validation
    def validate_phone_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain digits only."
            )

        if len(value) < 8 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 8 and 15 digits."
            )

        return value

    # 🎂 Date of birth validation
    def validate_date_of_birth(self, value):
        today = date.today()

        if value >= today:
            raise serializers.ValidationError(
                "Date of birth must be in the past."
            )

        age = today.year - value.year - (
            (today.month, today.day) < (value.month, value.day)
        )

        if age < 16:
            raise serializers.ValidationError(
                "User must be at least 16 years old."
            )

        return value

    # Override to ensure fields are included in cleaned_data for allauth adapter
    def get_cleaned_data(self):
        logger.debug("=== CustomRegisterSerializer.get_cleaned_data() called ===")
        data = super().get_cleaned_data()
        logger.debug(f"Base cleaned_data: {data}")
        
       
        
        # validated_data should be available after is_valid() is called
        if hasattr(self, 'validated_data') and self.validated_data:
            data['first_name'] = self.validated_data.get('first_name', '')
            data['last_name'] = self.validated_data.get('last_name', '')
            data['phone_number'] = self.validated_data.get('phone_number', '')
            data['date_of_birth'] = self.validated_data.get('date_of_birth')
            logger.debug(f"Updated cleaned_data with extra fields: {data}")
        else:
            logger.warning("validated_data not available in get_cleaned_data()")
        
        return data

    def save(self, request):
        
        # Check validated_data before calling super().save()
        validated_before = getattr(self, 'validated_data', {})
        logger.debug(f"validated_data before super().save(): {validated_before}")
        logger.debug(f"validated_data keys: {list(validated_before.keys()) if validated_before else 'None'}")
        
        # Get the user from parent save method (this calls the adapter)
        user = super().save(request)
        logger.debug(f"User created with ID: {user.id}, username: {user.username}")
        logger.debug(f"User fields after super().save(): first_name={user.first_name}, last_name={user.last_name}, phone_number={user.phone_number}, date_of_birth={user.date_of_birth}")


        validated = getattr(self, 'validated_data', {})
        logger.debug(f"validated_data in save(): {validated}")
        
        if validated:
            # Save all extra fields
            if 'first_name' in validated:
                user.first_name = validated.get("first_name", "")
                logger.debug(f"Set first_name to: {user.first_name}")
            if 'last_name' in validated:
                user.last_name = validated.get("last_name", "")
                logger.debug(f"Set last_name to: {user.last_name}")
            if 'phone_number' in validated:
                user.phone_number = validated.get("phone_number", "")
                logger.debug(f"Set phone_number to: {user.phone_number}")
            if 'date_of_birth' in validated:
                user.date_of_birth = validated.get("date_of_birth")
                logger.debug(f"Set date_of_birth to: {user.date_of_birth}")
        else:
            logger.error("validated_data is empty or not available in save() method!")

        user.role = "EMPLOYEE"

        # Save the user with all fields
        user.save()
        logger.debug(f"User saved. Final values: first_name={user.first_name}, last_name={user.last_name}, phone_number={user.phone_number}, date_of_birth={user.date_of_birth}")
        return user


class HRUpdateEmployeeSerializer(serializers.ModelSerializer):
    """
    HR can only update employment-related fields
    """
    class Meta:
        model = User
        fields = (
            "position",
            "joined_date",
        )
