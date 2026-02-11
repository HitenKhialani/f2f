from django.contrib.auth import get_user_model
from rest_framework import viewsets

from . import models, serializers

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


class StakeholderProfileViewSet(viewsets.ModelViewSet):
    queryset = models.StakeholderProfile.objects.select_related("user").all()
    serializer_class = serializers.StakeholderProfileSerializer


class KYCRecordViewSet(viewsets.ModelViewSet):
    queryset = models.KYCRecord.objects.select_related("profile", "verified_by").all()
    serializer_class = serializers.KYCRecordSerializer


class CropBatchViewSet(viewsets.ModelViewSet):
    queryset = models.CropBatch.objects.select_related("farmer").all()
    serializer_class = serializers.CropBatchSerializer
    
    def perform_create(self, serializer):
        # Automatically set farmer to the authenticated user
        serializer.save(farmer=self.request.user.stakeholderprofile)
        return super().perform_create(serializer)


class TransportRequestViewSet(viewsets.ModelViewSet):
    queryset = models.TransportRequest.objects.select_related(
        "batch", "requested_by", "from_party", "to_party", "transporter"
    ).all()
    serializer_class = serializers.TransportRequestSerializer


class InspectionReportViewSet(viewsets.ModelViewSet):
    queryset = models.InspectionReport.objects.select_related("batch", "distributor").all()
    serializer_class = serializers.InspectionReportSerializer


class BatchSplitViewSet(viewsets.ModelViewSet):
    queryset = models.BatchSplit.objects.select_related("parent_batch", "destination_retailer").all()
    serializer_class = serializers.BatchSplitSerializer


class RetailListingViewSet(viewsets.ModelViewSet):
    queryset = models.RetailListing.objects.select_related("batch", "retailer").all()
    serializer_class = serializers.RetailListingSerializer


class ConsumerScanViewSet(viewsets.ModelViewSet):
    queryset = models.ConsumerScan.objects.select_related("listing").all()
    serializer_class = serializers.ConsumerScanSerializer
