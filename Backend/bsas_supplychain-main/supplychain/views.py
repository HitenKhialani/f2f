from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from . import models, serializers
from .event_logger import log_batch_event
from .models import BatchEventType

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

class StakeholderProfileViewSet(viewsets.ModelViewSet):
    queryset = models.StakeholderProfile.objects.select_related("user").all()
    serializer_class = serializers.StakeholderProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['organization', 'user__username']
    filterset_fields = ['role', 'kyc_status']


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
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Verify user is distributor
        try:
            distributor_profile = self.request.user.stakeholderprofile
            if distributor_profile.role != models.StakeholderRole.DISTRIBUTOR:
                raise ValidationError("Only distributors can create inspection reports")
        except models.StakeholderProfile.DoesNotExist:
            raise ValidationError("User profile not found")
        
        # Save with distributor
        serializer.save(distributor=distributor_profile)


class BatchSplitViewSet(viewsets.ModelViewSet):
    queryset = models.BatchSplit.objects.select_related("parent_batch", "destination_retailer").all()
    serializer_class = serializers.BatchSplitSerializer
    
    def perform_create(self, serializer):
        # Get the parent batch
        parent_batch = serializer.validated_data['parent_batch']
        split_label = serializer.validated_data.get('split_label', '')
        quantity = serializer.validated_data.get('quantity', 0)
        destination_retailer = serializer.validated_data.get('destination_retailer')
        notes = serializer.validated_data.get('notes', '')
        
        # Create child crop batch
        import uuid
        child_batch = models.CropBatch.objects.create(
            product_batch_id=f"BATCH-{uuid.uuid4().hex[:8].upper()}",
            crop_type=parent_batch.crop_type,
            quantity=quantity,
            farm_location=parent_batch.farm_location,
            farmer=parent_batch.farmer,
            current_owner=self.request.user,
            status=models.BatchStatus.STORED,
            harvest_date=parent_batch.harvest_date,
            is_child_batch=True,
            parent_batch=parent_batch
        )
        
        # Create the batch split record linking parent to child
        serializer.save(child_batch=child_batch)


class RetailListingViewSet(viewsets.ModelViewSet):
    queryset = models.RetailListing.objects.select_related("batch", "retailer").all()
    serializer_class = serializers.RetailListingSerializer
    
    def perform_create(self, serializer):
        # Get the retailer's profile from the current user
        try:
            retailer_profile = self.request.user.stakeholderprofile
            if retailer_profile.role != models.StakeholderRole.RETAILER:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Only retailers can create listings")
            serializer.save(retailer=retailer_profile)
        except models.StakeholderProfile.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Retailer profile not found")


class ConsumerScanViewSet(viewsets.ModelViewSet):
    queryset = models.ConsumerScan.objects.select_related("listing").all()
    serializer_class = serializers.ConsumerScanSerializer
