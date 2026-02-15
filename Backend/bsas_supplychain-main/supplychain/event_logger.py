"""
Helper utilities for batch event logging.
"""
from supplychain.models import BatchEvent, BatchEventType


def log_batch_event(batch, event_type, user, metadata=None):
    """
    Create a batch event log entry.
    
    Args:
        batch: CropBatch instance
        event_type: BatchEventType choice
        user: User who performed the action
        metadata: Optional dict with additional context
    
    Returns:
        BatchEvent instance
    """
    return BatchEvent.objects.create(
        batch=batch,
        event_type=event_type,
        performed_by=user,
        metadata=metadata or {}
    )
