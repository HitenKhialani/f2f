from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets

from . import models, serializers
from .event_logger import log_batch_event
from .models import BatchEventType

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
    serializer_class = serializers.CropBatchSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.stakeholderprofile
        except:
            return models.CropBatch.objects.none()

        if profile.role == models.StakeholderRole.ADMIN:
            return models.CropBatch.objects.all()
            
        # Users see batches they own OR batches they are the farmer for
        return models.CropBatch.objects.filter(
            Q(current_owner=user) | Q(farmer=profile)
        ).distinct()
    
    def perform_create(self, serializer):
        # Automatically set farmer to the authenticated user
        batch = serializer.save(farmer=self.request.user.stakeholderprofile)
        
        # Log batch creation event
        log_batch_event(
            batch=batch,
            event_type=BatchEventType.CREATED,
            user=self.request.user,
            metadata={
                'crop_type': batch.crop_type,
                'quantity': str(batch.quantity),
                'harvest_date': batch.harvest_date.isoformat(),
            }
        )
        
        return batch


class TransportRequestViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TransportRequestSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.stakeholderprofile
        except:
            return models.TransportRequest.objects.none()

        if profile.role == models.StakeholderRole.ADMIN:
            return models.TransportRequest.objects.all()

        if profile.role == models.StakeholderRole.TRANSPORTER:
            # Transporters see PENDING requests OR requests assigned to them
            return models.TransportRequest.objects.filter(
                Q(status='PENDING') | Q(transporter=profile)
            )

        # Other roles see requests they are involved in
        return models.TransportRequest.objects.filter(
            Q(requested_by=profile) | 
            Q(from_party=profile) | 
            Q(to_party=profile)
        ).distinct()


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
