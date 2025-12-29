from django.urls import path, include
from dj_rest_auth.views import PasswordResetView, PasswordResetConfirmView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserProfileView
# from .views import HRDashboard, EmployeeDashboard

urlpatterns = [
    # dj-rest-auth login/logout/password reset
    path('', include('dj_rest_auth.urls')),

    # Registration (Signup)
    path('registration/', include('dj_rest_auth.registration.urls')),

    # Password Reset
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path(
        'password/reset/confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),

    # JWT Token Routes (Optional)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #  user profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
]
