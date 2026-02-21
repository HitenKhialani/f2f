"""
Views for Retailer-specific actions.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from . import models
from .batch_validators import BatchStatusTransitionValidator
from .event_logger import log_batch_event
from .models import BatchEventType, BatchStatus


class MarkBatchSoldView(APIView):
    """
    Retailer marks batch as sold.
    Transitions from LISTED to SOLD.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, batch_id):
        # Get batch
        try:
            batch = models.CropBatch.objects.get(id=batch_id)
        except models.CropBatch.DoesNotExist:
            return Response(
                {"success": False, "message": "Batch not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Suspend guard
        if batch.status == BatchStatus.SUSPENDED:
            return Response(
                {"success": False, "message": "This batch has been suspended and cannot proceed further."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user is retailer
        try:
            retailer_profile = request.user.stakeholderprofile
            if retailer_profile.role != models.StakeholderRole.RETAILER:
                return Response(
                    {"success": False, "message": "Only retailers can mark batches as sold"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except models.StakeholderProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "User profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify ownership
        if batch.current_owner != request.user:
            return Response(
                {"success": False, "message": "You do not own this batch"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify status
        if batch.status != BatchStatus.LISTED:
            return Response(
                {"success": False, "message": f"Cannot mark batch as sold with status {batch.status}. Batch must be LISTED first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate transition
        if not BatchStatusTransitionValidator.can_transition(
            batch, request.user, BatchStatus.SOLD
        ):
            return Response(
                {"success": False, "message": "Invalid status transition"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        batch.status = BatchStatus.SOLD
        batch.save()
        
        # Log event
        log_batch_event(
            batch=batch,
            event_type=BatchEventType.SOLD,
            user=request.user,
            metadata={}
        )
        
        return Response({
            "success": True,
            "message": "Batch marked as sold",
            "batch_id": batch.id,
            "status": batch.status,
        }, status=status.HTTP_200_OK)
