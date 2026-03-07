"""
Blockchain API Views

API endpoints for blockchain operations including:
- Manual batch anchoring
- Data integrity verification
- Anchor history retrieval
- Blockchain status monitoring
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import CropBatch, BatchEvent
from .hash_generator import generate_batch_hash
from .blockchain_service import get_blockchain_service

# Configure logging
logger = logging.getLogger(__name__)


class AnchorBatchView(APIView):
    """
    POST /api/batch/{id}/anchor/
    
    Manually trigger blockchain anchoring for a batch.
    Creates a hash of current batch data and anchors it to the blockchain.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, batch_id):
        """
        Anchor batch hash to blockchain.
        
        Request Body (optional):
            - context: Custom context string (default: "MANUAL_ANCHOR")
            
        Response:
            - success: bool
            - transaction_hash: str
            - block_number: int
            - gas_used: int
            - snapshot_hash: str
            - message: str
        """
        try:
            # Get batch by product_batch_id or public_batch_id
            batch = get_object_or_404(
                CropBatch,
                Q(product_batch_id=batch_id) | Q(public_batch_id=batch_id)
            )
            
            # Check permissions (only owner or admin can anchor)
            user = request.user
            if not self._can_anchor_batch(user, batch):
                return Response(
                    {"success": False, "error": "Permission denied. Only batch owner or admin can anchor."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get optional context from request
            context = request.data.get('context', 'MANUAL_ANCHOR')
            
            # Step 1: Generate batch hash
            logger.info(f"Manual anchor requested for batch {batch_id}")
            snapshot_hash = generate_batch_hash(batch)
            
            # Step 2: Get blockchain service
            blockchain = get_blockchain_service()
            
            # Step 3: Anchor to blockchain
            result = blockchain.anchor_batch_hash(
                batch_id=batch.product_batch_id,
                snapshot_hash=snapshot_hash,
                context=context
            )
            
            # Step 4: Create BatchEvent for this anchor
            event = BatchEvent.objects.create(
                batch=batch,
                event_type='BLOCKCHAIN_ANCHOR',
                performed_by=user,
                metadata={
                    'transaction_hash': result['transaction_hash'],
                    'block_number': result['block_number'],
                    'gas_used': result['gas_used'],
                    'context': context,
                    'manual': True
                }
            )
            
            # Step 5: Update batch status
            batch.last_anchored_at = event.timestamp
            batch.is_blockchain_verified = True
            batch.save(update_fields=['last_anchored_at', 'is_blockchain_verified'])
            
            return Response({
                "success": True,
                "message": "Batch successfully anchored to blockchain",
                "batch_id": batch.product_batch_id,
                "transaction_hash": result['transaction_hash'],
                "block_number": result['block_number'],
                "gas_used": result['gas_used'],
                "snapshot_hash": snapshot_hash.hex(),
                "record_index": result['record_index'],
                "context": context,
                "anchored_at": event.timestamp.isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Manual anchor failed for batch {batch_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Blockchain anchoring failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _can_anchor_batch(self, user, batch):
        """Check if user has permission to anchor this batch."""
        # Admin can anchor any batch
        if user.is_staff or user.is_superuser:
            return True
        
        # Batch owner can anchor
        if batch.current_owner == user:
            return True
        
        # Farmer can anchor their own batches
        if hasattr(user, 'stakeholderprofile'):
            if batch.farmer == user.stakeholderprofile:
                return True
        
        return False


class VerifyBatchView(APIView):
    """
    GET /api/batch/{id}/verify/
    
    Verify batch data integrity by comparing current database state
    with the hash stored on the blockchain.
    """
    permission_classes = []  # Public endpoint for consumer verification
    
    def get(self, request, batch_id):
        """
        Verify batch data integrity against blockchain.
        
        Response:
            - verified: bool
            - current_hash: str
            - stored_hash: str (or None)
            - blockchain_status: dict
            - message: str
        """
        try:
            # Get batch
            batch = get_object_or_404(
                CropBatch,
                Q(product_batch_id=batch_id) | Q(public_batch_id=batch_id)
            )
            
            # Get blockchain service
            blockchain = get_blockchain_service()
            
            # Verify integrity
            verification_result = blockchain.verify_batch_integrity(batch)
            
            # Build response
            response_data = {
                "success": True,
                "batch_id": batch.product_batch_id,
                "verified": verification_result['verified'],
                "current_hash": verification_result['current_hash'],
                "stored_hash": verification_result['stored_hash'],
                "message": verification_result['message'],
                "blockchain_record": {
                    "anchored_at": verification_result['anchored_at'],
                    "anchored_by": verification_result['anchored_by']
                } if verification_result['stored_hash'] else None,
                "batch_status": {
                    "last_anchored_at": batch.last_anchored_at.isoformat() if batch.last_anchored_at else None,
                    "is_blockchain_verified": batch.is_blockchain_verified
                }
            }
            
            # Always return 200 - verification result indicates success/failure, not HTTP status
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Verification failed for batch {batch_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Verification process failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BatchAnchorsListView(APIView):
    """
    GET /api/batch/{id}/anchors/
    
    Retrieve all blockchain anchors for a specific batch.
    Returns complete anchor history from the blockchain.
    """
    permission_classes = []  # Public endpoint for anchor history
    
    def get(self, request, batch_id):
        """
        List all blockchain anchors for a batch.
        
        Response:
            - batch_id: str
            - anchor_count: int
            - anchors: list of anchor records
        """
        try:
            # Get batch
            batch = get_object_or_404(
                CropBatch,
                Q(product_batch_id=batch_id) | Q(public_batch_id=batch_id)
            )
            
            # Get blockchain service
            blockchain = get_blockchain_service()
            
            # Get anchor count
            anchor_count = blockchain.get_anchor_count(batch.product_batch_id)
            
            # Retrieve all anchors
            anchors = []
            for i in range(anchor_count):
                try:
                    anchor = blockchain.get_anchor_by_index(batch.product_batch_id, i)
                    if anchor:
                        anchors.append({
                            "index": i,
                            "snapshot_hash": anchor['snapshot_hash'].hex(),
                            "anchored_at": anchor['anchored_at'],
                            "context": anchor['context'],
                            "anchored_by": anchor['anchored_by']
                        })
                except Exception as e:
                    logger.warning(f"Failed to retrieve anchor {i} for {batch_id}: {e}")
                    continue
            
            return Response({
                "success": True,
                "batch_id": batch.product_batch_id,
                "anchor_count": anchor_count,
                "anchors": anchors
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to list anchors for batch {batch_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve anchor history"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BlockchainStatusView(APIView):
    """
    GET /api/blockchain/status/
    
    Get overall blockchain system status including:
    - Connection health
    - Account balance
    - Gas prices
    - Total anchors
    """
    permission_classes = []  # Public endpoint
    
    def get(self, request):
        """
        Get blockchain system status.
        
        Response:
            - connected: bool
            - chain_id: int
            - account_address: str
            - balance: float
            - gas_price: int
            - contract_address: str
        """
        try:
            blockchain = get_blockchain_service()
            
            status_data = {
                "success": True,
                "connected": blockchain.is_healthy(),
                "chain_id": blockchain.w3.eth.chain_id if blockchain.w3 else None,
                "account_address": blockchain.account.address if blockchain.account else None,
                "balance": float(blockchain.get_balance()) if blockchain.account else None,
                "gas_price": blockchain.get_gas_price() if blockchain.w3 else None,
                "contract_address": blockchain.contract.address if blockchain.contract else None,
                "network": "Polygon Amoy Testnet"
            }
            
            return Response(status_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to get blockchain status: {e}")
            return Response({
                "success": False,
                "connected": False,
                "error": str(e),
                "message": "Blockchain service unavailable"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class RetryAnchorView(APIView):
    """
    POST /api/events/{event_id}/retry-anchor/
    
    Retry blockchain anchoring for a failed event.
    Useful when previous anchoring failed due to network issues.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, event_id):
        """
        Retry blockchain anchoring for an event.
        
        Response:
            - success: bool
            - new_transaction_hash: str (if successful)
            - message: str
        """
        try:
            # Get the event
            event = get_object_or_404(BatchEvent, id=event_id)
            
            # Check if already anchored
            if event.blockchain_tx_hash:
                return Response({
                    "success": False,
                    "error": "Event already anchored to blockchain",
                    "transaction_hash": event.blockchain_tx_hash
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user has permission
            if not request.user.is_staff and event.performed_by != request.user:
                return Response({
                    "success": False,
                    "error": "Permission denied"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get blockchain service
            blockchain = get_blockchain_service()
            
            # Generate hash
            snapshot_hash = generate_batch_hash(event.batch)
            
            # Anchor to blockchain
            result = blockchain.anchor_batch_hash(
                batch_id=event.batch.product_batch_id,
                snapshot_hash=snapshot_hash,
                context=f"RETRY_{event.event_type}"
            )
            
            # Update event
            event.blockchain_tx_hash = result['transaction_hash']
            event.blockchain_block_number = result['block_number']
            event.snapshot_hash = snapshot_hash.hex()
            
            # Remove error from metadata if present
            if 'blockchain_anchor_error' in event.metadata:
                del event.metadata['blockchain_anchor_error']
            
            event.save(update_fields=['blockchain_tx_hash', 'blockchain_block_number', 'snapshot_hash', 'metadata'])
            
            return Response({
                "success": True,
                "message": "Anchor retry successful",
                "event_id": event_id,
                "transaction_hash": result['transaction_hash'],
                "block_number": result['block_number']
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Anchor retry failed for event {event_id}: {e}")
            return Response({
                "success": False,
                "error": str(e),
                "message": "Anchor retry failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
