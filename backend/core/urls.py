from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, CurrentUserView, GroupListCreateView, GroupDetailView,
    GroupMembershipListCreateView, GroupMembershipDetailView,
    ExpenseListCreateView, ExpenseDetailView, PaymentListCreateView,
    CSVUploadView, ResolveAnomalyView, CSVImportReportView, GroupBalancesView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),

    # Groups & Memberships
    path('groups/', GroupListCreateView.as_view(), name='groups'),
    path('groups/<uuid:pk>/', GroupDetailView.as_view(), name='group_detail'),
    path('groups/<uuid:group_id>/memberships/', GroupMembershipListCreateView.as_view(), name='group_memberships'),
    path('groups/<uuid:group_id>/memberships/<uuid:pk>/', GroupMembershipDetailView.as_view(), name='group_membership_detail'),

    # Expenses & Payments
    path('expenses/', ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<uuid:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    path('payments/', PaymentListCreateView.as_view(), name='payments'),

    # Import & Anomalies
    path('imports/upload/', CSVUploadView.as_view(), name='csv_upload'),
    path('imports/anomalies/<uuid:pk>/resolve/', ResolveAnomalyView.as_view(), name='resolve_anomaly'),
    path('imports/<uuid:import_id>/report/', CSVImportReportView.as_view(), name='csv_import_report'),

    # Balances & Reports
    path('groups/<uuid:group_id>/balances/', GroupBalancesView.as_view(), name='group_balances'),
]
