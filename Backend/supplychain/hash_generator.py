"""
Batch Hash Generator Module

Generates deterministic SHA256 hashes of batch event payloads for blockchain anchoring.
Ensures data integrity by creating immutable fingerprints of critical lifecycle events,
excluding volatile or mutable fields (like payment statuses and ownership).
"""

import hashlib
import json
from decimal import Decimal
from typing import Optional, Dict, Any

from supplychain.models import BatchEventType


def _serialize_decimal(val) -> str:
    """Safely serialize decimal values to string."""
    if val is None:
        return "0.00"
    if isinstance(val, Decimal):
        return f"{val:.2f}"
    return str(val)


def generate_event_payload(batch, event_type: str, event_sequence: int, actor_id: Optional[int] = None) -> dict:
    """
    Generate a deterministic, event-specific payload dictionary.
    
    Extracts only the stable, security-critical fields relevant to the specific event.
    Excludes volatile fields like auto-generated IDs, updated_at timestamps, 
    payment statuses, and current ownership.
    
    Args:
        batch: CropBatch model instance
        event_type: String from BatchEventType
        event_sequence: The sequence number/index of this event in the batch's history
        actor_id: ID of the user performing the event
        
    Returns:
        dict: Canonical representation of event data with sorted keys
    """
    # 1. Common Base Fields (All Events)
    payload: Dict[str, Any] = {
        "event_type": event_type,
        "batch_id": batch.product_batch_id,
        "actor_id": actor_id,
        "event_sequence_number": event_sequence,
    }

    # 2. Event-Specific Security Fields
    if event_type == BatchEventType.CREATED:
        payload.update({
            "crop_type": batch.crop_type,
            "quantity": _serialize_decimal(batch.quantity),
            "harvest_date": batch.harvest_date.isoformat() if batch.harvest_date else None,
            "farm_location": batch.farm_location,
            "farmer_base_price_per_unit": _serialize_decimal(batch.farmer_base_price_per_unit),
            "is_child_batch": batch.is_child_batch,
            "parent_batch_id": batch.parent_batch.product_batch_id if batch.parent_batch else None,
        })
        
    elif event_type in [
        BatchEventType.TRANSPORT_REQUESTED,
        BatchEventType.TRANSPORT_REQUESTED_TO_RETAILER
    ]:
        # Typically these transitions are tied to a TransportRequest. 
        # For simplicity in hashing from the Batch state, we might capture the price/margins set so far.
        payload.update({
            "distributor_margin_per_unit": _serialize_decimal(batch.distributor_margin_per_unit),
        })

    elif event_type in [
        BatchEventType.TRANSPORT_ACCEPTED, 
        BatchEventType.TRANSPORT_STARTED
    ]:
        # Would optimally include transporter_fee, but this is stored on TransportRequest.
        # If we just anchor the event sequence and actor, that's still an immutable log of the state change.
        pass

    elif event_type in [
        BatchEventType.DELIVERED_TO_DISTRIBUTOR,
        BatchEventType.DELIVERED_TO_RETAILER,
        BatchEventType.ARRIVED_AT_DISTRIBUTOR,
        BatchEventType.ARRIVED_AT_RETAILER,
        BatchEventType.ARRIVAL_CONFIRMED_BY_DISTRIBUTOR,
        BatchEventType.ARRIVAL_CONFIRMED_BY_RETAILER,
        BatchEventType.STORED
    ]:
        pass

    elif event_type in [
        BatchEventType.INSPECTION_PASSED,
        BatchEventType.INSPECTION_FAILED,
        BatchEventType.INSPECTED
    ]:
        pass

    elif event_type == BatchEventType.LISTED:
        # Note: listing_price is on RetailListing. For the batch anchor, we record the margins fixed at this point.
        payload.update({
            "farmer_base_price_per_unit": _serialize_decimal(batch.farmer_base_price_per_unit),
            "distributor_margin_per_unit": _serialize_decimal(batch.distributor_margin_per_unit),
        })

    elif event_type == BatchEventType.SOLD:
        pass
        
    elif event_type in [BatchEventType.FULLY_SPLIT, BatchEventType.SUSPENDED, BatchEventType.TRANSPORT_REJECTED]:
        pass

    return payload


def generate_batch_hash(batch, event_type: str, event_sequence: int, actor_id: Optional[int] = None) -> bytes:
    """
    Generate a deterministic SHA256 hash of an event payload.
    
    Creates a bytes32-compatible hash (32 bytes) that can be stored
    on the blockchain.
    
    Args:
        batch: CropBatch model instance
        event_type: String from BatchEventType
        event_sequence: Event sequence number
        actor_id: Optional ID of user performing event
        
    Returns:
        bytes: 32-byte SHA256 hash
    """
    # Step 1: Get canonical payload representation
    payload = generate_event_payload(batch, event_type, event_sequence, actor_id)
    
    # Step 2: Convert to deterministic JSON string
    canonical_json = json.dumps(
        payload,
        sort_keys=True,
        separators=(',', ':'),
        default=str
    )
    
    # Step 3: Generate SHA256 hash
    hash_obj = hashlib.sha256(canonical_json.encode('utf-8'))
    hash_bytes = hash_obj.digest()
    
    assert len(hash_bytes) == 32, f"Expected 32 bytes, got {len(hash_bytes)}"
    return hash_bytes


def validate_hash_format(hash_bytes: bytes) -> bool:
    """Validate that the hash is in the correct format for blockchain."""
    if not isinstance(hash_bytes, bytes):
        return False
    if len(hash_bytes) != 32:
        return False
    if hash_bytes == b'\x00' * 32:
        return False
    return True


def hash_to_hex(hash_bytes: bytes) -> str:
    """Convert hash bytes to hexadecimal string representation."""
    return hash_bytes.hex()


def hex_to_hash(hex_string: str) -> bytes:
    """Convert hexadecimal string back to hash bytes."""
    if len(hex_string) != 64:
        raise ValueError(f"Expected 64 character hex string, got {len(hex_string)}")
    return bytes.fromhex(hex_string)
