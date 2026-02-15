from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from . import models, serializers
from .batch_validators import BatchStatusTransitionValidator
from .event_logger import log_batch_event
from .models import BatchEventType


class TransportRequestCreateView(APIView):
    """
    Create a transport request for a batch.
    Farmer initiates transport to distributor.
    """
    
    def post(self, request):
        batch_id = request.data.get('batch_id')
        distributor_id = request.data.get('distributor_id')
        
        if not batch_id or not distributor_id:
            return Response(
                {"success": False, "message": "batch_id and distributor_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get batch and validate ownership
        batch = get_object_or_404(models.CropBatch, id=batch_id)
        
        # Verify user is the farmer who owns this batch
        try:
            user_profile = request.user.stakeholderprofile
            if batch.farmer != user_profile:
                return Response(
                    {"success": False, "message": "You can only request transport for your own batches"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {"success": False, "message": "User profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status transition
        can_transition, error_msg = BatchStatusTransitionValidator.can_transition(
            batch, request.user, models.BatchStatus.TRANSPORT_REQUESTED
        )
        
        if not can_transition:
            return Response(
                {"success": False, "message": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get distributor
        distributor = get_object_or_404(
            models.StakeholderProfile, 
            id=distributor_id,
            role=models.StakeholderRole.DISTRIBUTOR
        )
        
        # Create transport request
        transport_request = models.TransportRequest.objects.create(
            batch=batch,
            requested_by=user_profile,
            from_party=user_profile,
            to_party=distributor,
            status='PENDING'
        )
        
        # Update batch status
        batch.status = models.BatchStatus.TRANSPORT_REQUESTED
        batch.save()
        
        # Log event
        log_batch_event(
            batch=batch,
            event_type=BatchEventType.TRANSPORT_REQUESTED,
            user=request.user,
            metadata={
                'distributor': distributor.user.username,
                'transport_request_id': transport_request.id,
            }
        )
        
        return Response({
            "success": True,
            "message": "Transport request created successfully",
            "transport_request_id": transport_request.id,
            "batch_status": batch.status
        }, status=status.HTTP_201_CREATED)


class TransportAcceptView(APIView):
    """
    Transporter accepts a transport request.
    """
    
    def post(self, request, pk):
        transport_request = get_object_or_404(models.TransportRequest, id=pk)
        batch = transport_request.batch
        
        # Verify user is a transporter
        try:
            user_profile = request.user.stakeholderprofile
            if user_profile.role != models.StakeholderRole.TRANSPORTER:
                return Response(
                    {"success": False, "message": "Only transporters can accept transport requests"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {"success": False, "message": "User profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status transition
        can_transition, error_msg = BatchStatusTransitionValidator.can_transition(
            batch, request.user, models.BatchStatus.IN_TRANSIT
        )
        
        if not can_transition:
            return Response(
                {"success": False, "message": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update transport request
        transport_request.transporter = user_profile
        transport_request.status = 'ACCEPTED'
        transport_request.save()
        
        # Update batch status
        batch.status = models.BatchStatus.IN_TRANSIT
        batch.save()
        
        # Log event
        log_batch_event(
            batch=batch,
            event_type=BatchEventType.TRANSPORT_ACCEPTED,
            user=request.user,
            metadata={
                'transport_request_id': transport_request.id,
            }
        )
        
        return Response({
            "success": True,
            "message": "Transport request accepted",
            "batch_status": batch.status
        }, status=status.HTTP_200_OK)


class TransportDeliverView(APIView):
    """
    Transporter marks delivery as complete.
    """
    
    def post(self, request, pk):
        transport_request = get_object_or_404(models.TransportRequest, id=pk)
        batch = transport_request.batch
        
        # Verify user is the assigned transporter
        try:
            user_profile = request.user.stakeholderprofile
            if transport_request.transporter != user_profile:
                return Response(
                    {"success": False, "message": "Only the assigned transporter can mark delivery"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {"success": False, "message": "User profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        # Validation is handled by the delivery logic below which sets correct status based on destination
        
        # Update transport request
        transport_request.status = 'DELIVERED'
        transport_request.save()
        
        # Update batch status and owner based on destination
        to_party_role = transport_request.to_party.role
        
        if to_party_role == models.StakeholderRole.DISTRIBUTOR:
            batch.status = models.BatchStatus.DELIVERED_TO_DISTRIBUTOR
            event_type = BatchEventType.DELIVERED_TO_DISTRIBUTOR
        elif to_party_role == models.StakeholderRole.RETAILER:
            batch.status = models.BatchStatus.DELIVERED_TO_RETAILER
            event_type = BatchEventType.DELIVERED_TO_RETAILER
        else:
            return Response(
                {"success": False, "message": "Invalid destination role"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        batch.current_owner = transport_request.to_party.user
        batch.save()
        
        # Log event
        log_batch_event(
            batch=batch,
            event_type=event_type,
            user=request.user,
            metadata={
                'new_owner': batch.current_owner.username,
                'transport_request_id': transport_request.id,
                'destination_role': to_party_role,
            }
        )
        
        return Response({
            "success": True,
            "message": "Delivery confirmed",
            "batch_status": batch.status,
            "new_owner": batch.current_owner.username
        }, status=status.HTTP_200_OK)


class TransportRejectView(APIView):
    """
    Transporter rejects a transport request.
    Returns batch to CREATED status.
    """
    
    def post(self, request, pk):
        transport_request = get_object_or_404(models.TransportRequest, id=pk)
        batch = transport_request.batch
        
        # Verify user is a transporter
        try:
            user_profile = request.user.stakeholderprofile
            if user_profile.role != models.StakeholderRole.TRANSPORTER:
                return Response(
                    {"success": False, "message": "Only transporters can reject transport requests"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {"success": False, "message": "User profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if transport_request.status != 'PENDING':
            return Response(
                {"success": False, "message": "Only pending requests can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Update transport request
        transport_request.status = 'REJECTED'
        transport_request.save()
        
        # Reset batch status based on where it came from
        if batch.status == models.BatchStatus.TRANSPORT_REQUESTED:
            batch.status = models.BatchStatus.CREATED
        elif batch.status == models.BatchStatus.TRANSPORT_REQUESTED_TO_RETAILER:
            batch.status = models.BatchStatus.STORED_BY_DISTRIBUTOR
        
        batch.save()
        
        # Log event
        log_batch_event(
            batch=batch,
            event_type=models.BatchEventType.TRANSPORT_REJECTED,
            user=request.user,
            metadata={
                'transport_request_id': transport_request.id,
            }
        )
        
        return Response({
            "success": True,
            "message": "Transport request rejected",
            "batch_status": batch.status
        }, status=status.HTTP_200_OK)
