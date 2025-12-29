from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

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

    # Authentication (loaded from User app)
    path('api/auth/', include('User.urls')),
    path('api/role/', include('Dashboard.urls')),

    path('dashboard/', include('Dashboard.urls')),

    # user profile
    path('user/', include('User.urls')),

    # Journal related urls
    path('api/journal/', include('journal.urls')),

    # Swagger / ReDoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]


