"""URL configuration for supplychain project."""
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from supplychain import views
from supplychain.admin_views import (
    AllKYCListView,
    DashboardStatsView,
    KYCDecisionView,
    PendingKYCListView,
    UserDetailView,
    UserListView,
)
from supplychain.auth_views import LoginView, LogoutView, MeView, RegisterView
from supplychain.transport_views import (
    TransportRequestCreateView,
    TransportAcceptView,
    TransportDeliverView,
    TransportRejectView,
)
from supplychain.consumer_views import BatchTraceView
from supplychain.distributor_views import StoreBatchView, RequestTransportToRetailerView
from supplychain.retailer_views import MarkBatchSoldView

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"stakeholders", views.StakeholderProfileViewSet)
router.register(r"kyc-records", views.KYCRecordViewSet)
router.register(r"crop-batches", views.CropBatchViewSet, basename="cropbatch")
router.register(r"transport-requests", views.TransportRequestViewSet, basename="transportrequest")
router.register(r"inspection-reports", views.InspectionReportViewSet)
router.register(r"batch-splits", views.BatchSplitViewSet)
router.register(r"retail-listings", views.RetailListingViewSet)
router.register(r"consumer-scans", views.ConsumerScanViewSet)

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    # Auth endpoints
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
    # Admin endpoints
    path("api/admin/stats/", DashboardStatsView.as_view(), name="admin-stats"),
    path("api/admin/kyc/pending/", PendingKYCListView.as_view(), name="admin-kyc-pending"),
    path("api/admin/kyc/all/", AllKYCListView.as_view(), name="admin-kyc-all"),
    path("api/admin/kyc/decide/<int:pk>/", KYCDecisionView.as_view(), name="admin-kyc-decide"),
    path("api/admin/users/", UserListView.as_view(), name="admin-users"),
    path("api/admin/users/<int:pk>/", UserDetailView.as_view(), name="admin-user-detail"),
    # Transport workflow endpoints
    path("api/transport/request/", TransportRequestCreateView.as_view(), name="transport-request"),
    path("api/transport/<int:pk>/accept/", TransportAcceptView.as_view(), name="transport-accept"),
    path("api/transport/<int:pk>/deliver/", TransportDeliverView.as_view(), name="transport-deliver"),
    path("api/transport/<int:pk>/reject/", TransportRejectView.as_view(), name="transport-reject"),
    # Consumer endpoints
    path("api/public/trace/<str:public_id>/", BatchTraceView.as_view(), name="consumer-trace"),
    # Distributor endpoints
    path("api/distributor/batch/<int:batch_id>/store/", StoreBatchView.as_view(), name="distributor-store-batch"),
    path("api/distributor/transport/request-to-retailer/", RequestTransportToRetailerView.as_view(), name="distributor-request-transport-retailer"),
    # Retailer endpoints
    path("api/retailer/batch/<int:batch_id>/mark-sold/", MarkBatchSoldView.as_view(), name="retailer-mark-sold"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
