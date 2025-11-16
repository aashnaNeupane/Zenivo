from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from dj_rest_auth.views import PasswordResetView, PasswordResetConfirmView

# Swagger / ReDoc schema view
schema_view = get_schema_view(
    openapi.Info(
        title="Zenivo API",
        default_version='v1',
        description="API documentation for Zenivo Backend",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # dj-rest-auth endpoints (login/logout/password reset)
    path('api/auth/', include('dj_rest_auth.urls')),

        # dj-rest-auth registration endpoints (signup)
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

# Password reset
    path('api/auth/password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path(
        'api/auth/password/reset/confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),

    # Optional: direct JWT endpoints if needed
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Swagger / ReDoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
