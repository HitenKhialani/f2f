"""
Batch Edit API Views

API endpoints for batch editing with blockchain tamper explanation:
- Batch editing with edit logging
- Tamper explanation retrieval for failed verifications
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import CropBatch, StakeholderRole, BatchEditLog, IntegrityStatus

# Configure logging
logger = logging.getLogger(__name__)


class EditBatchView(APIView):
    """
    POST /api/batch/{id}/edit/
    
    Edit batch data with field-level tracking for blockchain tamper explanation.
    All stakeholders (Farmer, Transporter, Distributor, Retailer, Admin) can edit batches.
    Each edit is logged to BatchEditLog for tamper detection.
    """
    permission_classes = [IsAuthenticated]
    
    # Editable fields by different roles
    EDITABLE_FIELDS = {
        'quantity': 'quantity',
        'crop_type': 'crop_type',
        'farm_location': 'farm_location',
        'harvest_date': 'harvest_date',
        'farmer_base_price_per_unit': 'farmer_base_price_per_unit',
        'distributor_margin_per_unit': 'distributor_margin_per_unit',
        'description': None,  # Not a direct model field, stored in metadata
        'transport_cost': None,  # May be on TransportRequest
        'packaging': None,  # Metadata field
    }
    
    def post(self, request, batch_id):
        """
        Edit batch data and log the changes.
        
        Request Body:
            - fields: dict of field names and new values
            - reason: optional reason for the edit
            
        Response:
            - success: bool
            - edited_fields: list of edited field names
            - log_entries: list of created log entries
        """
        try:
            # Get batch
            batch = get_object_or_404(
                CropBatch,
                Q(product_batch_id=batch_id) | Q(public_batch_id=batch_id)
            )
            
            # Check permissions
            user = request.user
            if not self._can_edit_batch(user, batch):
                return Response(
                    {"success": False, "error": "Permission denied. You cannot edit this batch."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get user's role
            try:
                profile = user.stakeholderprofile
                user_role = profile.role
            except:
                # If user has no profile but is staff, treat as admin
                if user.is_staff or user.is_superuser:
                    user_role = StakeholderRole.ADMIN
                else:
                    return Response(
                        {"success": False, "error": "User profile not found."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get fields to edit
            fields_to_edit = request.data.get('fields', {})
            if not fields_to_edit:
                return Response(
                    {"success": False, "error": "No fields provided for editing."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate editable fields
            invalid_fields = [f for f in fields_to_edit.keys() if f not in self.EDITABLE_FIELDS]
            if invalid_fields:
                return Response(
                    {"success": False, "error": f"Cannot edit fields: {', '.join(invalid_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Track edits
            edited_fields = []
            log_entries = []
            
            # Process each field edit
            for field_name, new_value in fields_to_edit.items():
                # Get old value
                old_value = self._get_field_value(batch, field_name)
                
                # Skip if value hasn't changed
                if str(old_value) == str(new_value):
                    continue
                
                # Update the field
                self._set_field_value(batch, field_name, new_value)
                
                # Create edit log entry
                log_entry = BatchEditLog.objects.create(
                    batch=batch,
                    field_name=field_name,
                    old_value=str(old_value) if old_value is not None else "",
                    new_value=str(new_value) if new_value is not None else "",
                    modified_by_user=user,
                    modified_by_role=user_role
                )
                
                edited_fields.append(field_name)
                log_entries.append({
                    'field_name': field_name,
                    'old_value': log_entry.old_value,
                    'new_value': log_entry.new_value,
                    'timestamp': log_entry.timestamp.isoformat()
                })
            
            # Save batch if any fields were edited
            if edited_fields:
                batch.save()
                
                # Update integrity status to reflect potential tampering
                if batch.integrity_status == IntegrityStatus.VERIFIED:
                    batch.integrity_status = IntegrityStatus.INTEGRITY_FAILED
                    batch.save(update_fields=['integrity_status'])
                
                logger.info(f"Batch {batch_id} edited by {user.username} ({user_role}): {edited_fields}")
            
            return Response({
                "success": True,
                "batch_id": batch.product_batch_id,
                "edited_fields": edited_fields,
                "edit_count": len(log_entries),
                "log_entries": log_entries,
                "modified_by": user.username,
                "modified_role": user_role,
                "message": f"Successfully edited {len(edited_fields)} field(s)" if edited_fields else "No changes made"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Batch edit failed for {batch_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Batch edit failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _can_edit_batch(self, user, batch):
        """Check if user has permission to edit this batch."""
        # Admin can edit any batch
        if user.is_staff or user.is_superuser:
            return True
        
        # Batch owner can edit
        if batch.current_owner == user:
            return True
        
        # Farmer can edit their own batches
        try:
            if batch.farmer == user.stakeholderprofile:
                return True
        except:
            pass
        
        # Check if user is involved in transport/distribution/retail
        try:
            profile = user.stakeholderprofile
            role = profile.role
            
            # Transporters can edit batches they're transporting
            if role == StakeholderRole.TRANSPORTER:
                from .models import TransportRequest
                if TransportRequest.objects.filter(
                    batch=batch,
                    transporter=profile
                ).exists():
                    return True
            
            # Distributors can edit batches at their location
            if role == StakeholderRole.DISTRIBUTOR:
                from .models import TransportRequest
                if TransportRequest.objects.filter(
                    batch=batch,
                    to_party=profile
                ).exists():
                    return True
            
            # Retailers can edit batches they're selling
            if role == StakeholderRole.RETAILER:
                from .models import RetailListing
                if RetailListing.objects.filter(
                    batch=batch,
                    retailer=profile
                ).exists():
                    return True
                    
        except:
            pass
        
        return False
    
    def _get_field_value(self, batch, field_name):
        """Get current value of a batch field."""
        if hasattr(batch, field_name):
            value = getattr(batch, field_name)
            # Handle Decimal fields
            if value is not None:
                return str(value)
            return value
        return None
    
    def _set_field_value(self, batch, field_name, new_value):
        """Set a new value for a batch field."""
        if hasattr(batch, field_name):
            field = batch._meta.get_field(field_name)
            
            # Handle Decimal fields
            if field.get_internal_type() == 'DecimalField':
                from decimal import Decimal
                new_value = Decimal(str(new_value))
            
            setattr(batch, field_name, new_value)


class BatchEditLogView(APIView):
    """
    GET /api/batch/{id}/edit-logs/
    
    Retrieve edit history for a batch.
    Used for displaying tamper explanations in the UI.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, batch_id):
        """
        Get edit logs for a batch.
        
        Response:
            - edit_logs: list of edit log entries
        """
        try:
            batch = get_object_or_404(
                CropBatch,
                Q(product_batch_id=batch_id) | Q(public_batch_id=batch_id)
            )
            
            # Get edit logs
            logs = BatchEditLog.objects.filter(batch=batch).order_by('-timestamp')
            
            log_data = []
            for log in logs:
                log_data.append({
                    'id': log.id,
                    'field_name': log.field_name,
                    'old_value': log.old_value,
                    'new_value': log.new_value,
                    'modified_by': log.modified_by_user.username if log.modified_by_user else 'Unknown',
                    'modified_by_role': log.modified_by_role,
                    'timestamp': log.timestamp.isoformat()
                })
            
            return Response({
                "success": True,
                "batch_id": batch.product_batch_id,
                "edit_count": len(log_data),
                "edit_logs": log_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to retrieve edit logs for {batch_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve edit logs"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_tampered_fields(batch):
    """
    Get list of tampered fields for a batch based on edit logs.
    Used by VerifyBatchView when verification fails.
    
    Args:
        batch: CropBatch instance
        
    Returns:
        List of dicts with tampered field details
    """
    # Get all edit logs for this batch
    logs = BatchEditLog.objects.filter(batch=batch).order_by('-timestamp')
    
    tampered_fields = []
    seen_fields = set()
    
    for log in logs:
        # Only include the most recent edit for each field
        if log.field_name not in seen_fields:
            tampered_fields.append({
                'field': log.field_name,
                'old_value': log.old_value,
                'new_value': log.new_value,
                'modified_by': log.modified_by_user.username if log.modified_by_user else 'Unknown',
                'modified_role': log.modified_by_role,
                'modified_at': log.timestamp.isoformat()
            })
            seen_fields.add(log.field_name)
    
    return tampered_fields
