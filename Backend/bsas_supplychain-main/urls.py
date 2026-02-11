"""URL configuration for supplychain project."""
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from supplychain import views
from supplychain.auth_views import RegisterView, LoginView, LogoutView, MeView

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"stakeholders", views.StakeholderProfileViewSet)
router.register(r"kyc-records", views.KYCRecordViewSet)
router.register(r"crop-batches", views.CropBatchViewSet)
router.register(r"transport-requests", views.TransportRequestViewSet)
router.register(r"inspection-reports", views.InspectionReportViewSet)
router.register(r"batch-splits", views.BatchSplitViewSet)
router.register(r"retail-listings", views.RetailListingViewSet)
router.register(r"consumer-scans", views.ConsumerScanViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    # Auth endpoints
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
]
