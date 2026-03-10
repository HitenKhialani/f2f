"""
Helper utilities for batch event logging.
Integrates with blockchain for critical event anchoring.
"""
import logging
from supplychain.models import BatchEvent, BatchEventType

# Configure logging
logger = logging.getLogger(__name__)

# Events that should be anchored to blockchain for tamper-proof audit trail
CRITICAL_BLOCKCHAIN_EVENTS = {
    BatchEventType.CREATED,
    BatchEventType.DELIVERED_TO_DISTRIBUTOR,
    BatchEventType.DELIVERED_TO_RETAILER,
    BatchEventType.SOLD,
}


def log_batch_event(batch, event_type, user, metadata=None, anchor_to_blockchain=True):
    """
    Create a batch event log entry.
    
    For critical events, automatically anchors a hash of the batch data
    to the blockchain for tamper-proof verification.
    
    Args:
        batch: CropBatch instance
        event_type: BatchEventType choice
        user: User who performed the action
        metadata: Optional dict with additional context
        anchor_to_blockchain: Whether to anchor critical events (default: True)
    
    Returns:
        BatchEvent instance
    """
    # Ensure metadata is a dict
    if metadata is None:
        metadata = {}
    
    # Add standard fields
    metadata.update({
        'batch_status': batch.status,
        'batch_quantity': str(batch.quantity),
        'batch_crop_type': batch.crop_type,
        'performer_username': user.username,
        'performer_role': getattr(user.stakeholderprofile, 'role', 'unknown') if hasattr(user, 'stakeholderprofile') else 'unknown'
    })
    
    # Add ownership info if relevant
    if batch.current_owner:
        metadata['current_owner'] = batch.current_owner.username
    
    # Create the event record
    event = BatchEvent.objects.create(
        batch=batch,
        event_type=event_type,
        performed_by=user,
        metadata=metadata
    )
    
    # Anchor to blockchain for critical events
    if anchor_to_blockchain and event_type in CRITICAL_BLOCKCHAIN_EVENTS:
        try:
            _anchor_event_to_blockchain(event, batch, event_type, user)
        except Exception as e:
            # Log error but don't fail the event creation
            # The event is still valid even if blockchain anchoring fails
            logger.error(f"Blockchain anchoring failed for event {event.id}: {e}")
            # Store failure info in metadata for retry later
            event.metadata['blockchain_anchor_error'] = str(e)
            event.save(update_fields=['metadata'])
    
    return event


def _anchor_event_to_blockchain(event, batch, event_type, user):
    """
    Anchor batch hash to blockchain for tamper-proof verification.
    
    This is an internal helper function that handles the blockchain
    anchoring process. It's separated from log_batch_event for
    better error isolation.
    
    Args:
        event: BatchEvent instance (will be updated with blockchain data)
        batch: CropBatch instance
        event_type: The event type being anchored
        user: The user performing the action
    
    Raises:
        Exception: If blockchain operation fails
    """
    # Import here to avoid circular imports
    from .hash_generator import generate_batch_hash
    from .blockchain_service import get_blockchain_service
    from .models import BatchEvent
    
    logger.info(f"Anchoring event {event.id} for batch {batch.product_batch_id} to blockchain")
    
    # Calculate event sequence number (1-based index)
    event_sequence = BatchEvent.objects.filter(batch=batch, timestamp__lte=event.timestamp).count()
    
    # Step 1: Generate deterministic hash of event payload
    batch_hash = generate_batch_hash(
        batch=batch, 
        event_type=event_type, 
        event_sequence=event_sequence, 
        actor_id=user.id if user else None
    )
    logger.debug(f"Generated payload hash: {batch_hash.hex()[:16]}... for batch {batch.product_batch_id}")
    
    # Step 2: Get blockchain service
    blockchain = get_blockchain_service()
    
    # Step 3: Anchor hash to blockchain
    context = event_type  # Use event type as context
    
    result = blockchain.anchor_batch_hash(
        batch_id=batch.product_batch_id,
        snapshot_hash=batch_hash,
        context=context
    )
    
    # Step 4: Update event with blockchain data
    event.blockchain_tx_hash = result['transaction_hash']
    event.blockchain_block_number = result['block_number']
    event.snapshot_hash = batch_hash.hex()
    event.save(update_fields=['blockchain_tx_hash', 'blockchain_block_number', 'snapshot_hash'])
    
    # Step 5: Update batch with anchor timestamp
    batch.last_anchored_at = event.timestamp
    batch.is_blockchain_verified = True
    batch.save(update_fields=['last_anchored_at', 'is_blockchain_verified'])
    
    logger.info(
        f"Successfully anchored batch {batch.product_batch_id} "
        f"at block {result['block_number']} "
        f"(tx: {result['transaction_hash'][:20]}...)"
    )


def log_ownership_transfer(batch, from_user, to_user, event_type, user_performing_action, reason=None):
    """
    Log a specific ownership transfer event.
    
    Args:
        batch: CropBatch instance
        from_user: User losing ownership
        to_user: User gaining ownership
        event_type: BatchEventType for the transfer
        user_performing_action: User who initiated the transfer
        reason: Optional reason for transfer
    
    Returns:
        BatchEvent instance
    """
    metadata = {
        'from_owner': from_user.username if from_user else None,
        'to_owner': to_user.username if to_user else None,
        'reason': reason or 'Standard workflow transition'
    }
    
    return log_batch_event(
        batch=batch,
        event_type=event_type,
        user=user_performing_action,
        metadata=metadata
    )


def get_event_blockchain_status(event):
    """
    Get blockchain verification status for an event.
    
    Args:
        event: BatchEvent instance
        
    Returns:
        dict: Blockchain status information
    """
    if not event.blockchain_tx_hash:
        return {
            'anchored': False,
            'message': 'Not anchored to blockchain'
        }
    
    return {
        'anchored': True,
        'transaction_hash': event.blockchain_tx_hash,
        'block_number': event.blockchain_block_number,
        'snapshot_hash': event.snapshot_hash,
        'message': 'Anchored to blockchain'
    }
