from django.urls import path
from .views import HRDashboard, EmployeeDashboard

urlpatterns = [
    # HR Dashboard
    path('hr/', HRDashboard.as_view(), name='hr_dashboard'),

    # Employee Dashboard
    path('employee/', EmployeeDashboard.as_view(), name='employee_dashboard'),

    
]
