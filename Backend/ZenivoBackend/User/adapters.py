from allauth.account.adapter import DefaultAccountAdapter
import logging

logger = logging.getLogger(__name__)

class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter to handle extra signup fields and enforce role assignment.
    Works with both forms (web) and serializers (API via dj_rest_auth).
    """

    def save_user(self, request, user, form, commit=True):
        """
        Override the default save_user method to include extra fields:
        - first_name
        - last_name
        - phone_number
        - date_of_birth
        Also enforce role = EMPLOYEE.
        
        Handles both form.cleaned_data (web forms) and serializer validated_data (API).
        """
        logger.debug("=== CustomAccountAdapter.save_user() called ===")
        logger.debug(f"Form type: {type(form)}")
        logger.debug(f"Form attributes: {dir(form)}")
        
        # Check what data is available
        has_cleaned_data = hasattr(form, 'cleaned_data')
        has_validated_data = hasattr(form, 'validated_data')
        logger.debug(f"Has cleaned_data: {has_cleaned_data}")
        logger.debug(f"Has validated_data: {has_validated_data}")
        
        if has_cleaned_data:
            logger.debug(f"cleaned_data: {form.cleaned_data if form.cleaned_data else 'Empty'}")
        if has_validated_data:
            logger.debug(f"validated_data: {form.validated_data if form.validated_data else 'Empty'}")
        
        # Call default behavior first (handles email, username, password)
        user = super().save_user(request, user, form, commit=False)
        logger.debug(f"User after super().save_user(): first_name={user.first_name}, last_name={user.last_name}, phone_number={user.phone_number}, date_of_birth={user.date_of_birth}")

        # Handle both form (with cleaned_data) and serializer (with validated_data)
        # When called from dj_rest_auth, 'form' is actually the serializer instance
        if hasattr(form, 'cleaned_data') and form.cleaned_data:
            # Traditional allauth form (web interface)
            logger.debug("Using cleaned_data (web form)")
            user.first_name = form.cleaned_data.get('first_name', '')
            user.last_name = form.cleaned_data.get('last_name', '')
            user.phone_number = form.cleaned_data.get('phone_number', '')
            user.date_of_birth = form.cleaned_data.get('date_of_birth')
            logger.debug(f"Set from cleaned_data: first_name={user.first_name}, last_name={user.last_name}, phone_number={user.phone_number}, date_of_birth={user.date_of_birth}")
        elif hasattr(form, 'validated_data') and form.validated_data:
            # dj_rest_auth serializer (API)
            logger.debug("Using validated_data (API serializer)")
            user.first_name = form.validated_data.get('first_name', '')
            user.last_name = form.validated_data.get('last_name', '')
            user.phone_number = form.validated_data.get('phone_number', '')
            user.date_of_birth = form.validated_data.get('date_of_birth')
            logger.debug(f"Set from validated_data: first_name={user.first_name}, last_name={user.last_name}, phone_number={user.phone_number}, date_of_birth={user.date_of_birth}")
        else:
            logger.warning("Neither cleaned_data nor validated_data available in adapter!")

        # Force role
        user.role = 'EMPLOYEE'
        logger.debug(f"Set role to: {user.role}")

        if commit:
            user.save()
            logger.debug("User saved in adapter")

        return user
