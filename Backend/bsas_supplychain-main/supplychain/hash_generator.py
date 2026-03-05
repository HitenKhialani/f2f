"""
Batch Hash Generator Module

Generates deterministic SHA256 hashes of batch data for blockchain anchoring.
Ensures data integrity by creating immutable fingerprints of batch state.
"""

import hashlib
import json
from datetime import datetime
from typing import Optional


def generate_canonical_data(batch) -> dict:
    """
    Extract relevant batch fields and create a deterministic dictionary.
    
    Only includes fields that represent the actual state of the batch.
    Excludes volatile fields like auto-generated IDs, timestamps that change
    on every save, and internal Django fields.
    
    Args:
        batch: CropBatch model instance
        
    Returns:
        dict: Canonical representation of batch data with sorted keys
    """
    # Extract core batch identity fields
    # These uniquely identify the batch and never change
    data = {
        # Batch identification (stable fields)
        "product_batch_id": batch.product_batch_id,
        "public_batch_id": batch.public_batch_id,
        "crop_type": batch.crop_type,
        
        # Quantity and financial data
        "quantity": str(batch.quantity),  # Convert Decimal to string for consistency
        "farmer_base_price_per_unit": str(batch.farmer_base_price_per_unit),
        "distributor_margin_per_unit": str(batch.distributor_margin_per_unit),
        
        # Status and ownership
        "status": batch.status,
        "current_owner_id": batch.current_owner.id if batch.current_owner else None,
        
        # Farm and harvest details
        "farm_location": batch.farm_location,
        "harvest_date": batch.harvest_date.isoformat() if batch.harvest_date else None,
        
        # Batch lineage (for split batches)
        "is_child_batch": batch.is_child_batch,
        "parent_batch_id": batch.parent_batch.product_batch_id if batch.parent_batch else None,
        
        # Financial status
        "financial_status": batch.financial_status,
        "current_phase": batch.current_phase,
    }
    
    # Add payment status fields (these change during lifecycle)
    payment_fields = [
        "farmer_payment_status",
        "transporter_payment_status", 
        "distributor_payment_status",
        "retailer_payment_to_transporter_status",
        "distributor_payment_to_farmer_status",
        "distributor_payment_to_transporter_status",
        "farmer_payment_to_transporter_status",
        "retailer_payment_to_distributor_status",
        "distributor_payment_to_transporter_retailer_phase_status",
    ]
    
    for field in payment_fields:
        data[field] = getattr(batch, field, "PENDING")
    
    # Add event history (critical for verification)
    # Only include event types and timestamps, not internal IDs
    if hasattr(batch, 'events'):
        events_data = []
        for event in batch.events.all().order_by('timestamp'):
            event_dict = {
                "event_type": event.event_type,
                "timestamp": event.timestamp.isoformat(),
                "performer": event.performed_by.username if event.performed_by else "system",
            }
            # Include metadata if it exists (sorted for determinism)
            if event.metadata:
                # Filter metadata to only include relevant fields
                filtered_metadata = {
                    k: v for k, v in sorted(event.metadata.items())
                    if k not in ['batch_status', 'batch_quantity', 'batch_crop_type', 'performer_username', 'performer_role']
                }
                if filtered_metadata:
                    event_dict["metadata"] = filtered_metadata
            
            events_data.append(event_dict)
        
        data["events"] = events_data
    
    return data


def generate_batch_hash(batch) -> bytes:
    """
    Generate a deterministic SHA256 hash of batch data.
    
    Creates a bytes32-compatible hash (32 bytes) that can be stored
    on the blockchain. The hash is deterministic - the same batch data
    will always produce the same hash.
    
    Args:
        batch: CropBatch model instance
        
    Returns:
        bytes: 32-byte SHA256 hash
        
    Example:
        >>> batch = CropBatch.objects.get(product_batch_id="BATCH-20240305-ABC12345")
        >>> hash_bytes = generate_batch_hash(batch)
        >>> print(hash_bytes.hex())
        'a1b2c3d4e5f6...'
    """
    # Step 1: Get canonical data representation
    data = generate_canonical_data(batch)
    
    # Step 2: Convert to deterministic JSON string
    # sort_keys=True ensures consistent key ordering
    # separators=(',', ':') removes whitespace for compactness
    canonical_json = json.dumps(
        data,
        sort_keys=True,
        separators=(',', ':'),
        default=str  # Handle any non-serializable types
    )
    
    # Step 3: Generate SHA256 hash
    # hashlib.sha256 returns a hash object
    hash_obj = hashlib.sha256(canonical_json.encode('utf-8'))
    
    # Step 4: Get digest as bytes (32 bytes for SHA256)
    hash_bytes = hash_obj.digest()
    
    # Verify we got exactly 32 bytes (bytes32 format required by smart contract)
    assert len(hash_bytes) == 32, f"Expected 32 bytes, got {len(hash_bytes)}"
    
    return hash_bytes


def validate_hash_format(hash_bytes: bytes) -> bool:
    """
    Validate that the hash is in the correct format for blockchain.
    
    Args:
        hash_bytes: The hash bytes to validate
        
    Returns:
        bool: True if valid bytes32 format, False otherwise
    """
    if not isinstance(hash_bytes, bytes):
        return False
    if len(hash_bytes) != 32:
        return False
    # Ensure it's not all zeros (would indicate empty hash)
    if hash_bytes == b'\x00' * 32:
        return False
    return True


def hash_to_hex(hash_bytes: bytes) -> str:
    """
    Convert hash bytes to hexadecimal string representation.
    
    Args:
        hash_bytes: 32-byte hash
        
    Returns:
        str: Hex string (64 characters)
    """
    return hash_bytes.hex()


def hex_to_hash(hex_string: str) -> bytes:
    """
    Convert hexadecimal string back to hash bytes.
    
    Args:
        hex_string: 64-character hex string
        
    Returns:
        bytes: 32-byte hash
        
    Raises:
        ValueError: If hex_string is not valid
    """
    if len(hex_string) != 64:
        raise ValueError(f"Expected 64 character hex string, got {len(hex_string)}")
    return bytes.fromhex(hex_string)


# =============================================================================
# TEST SNIPPET
# =============================================================================

if __name__ == "__main__":
    """
    Test the hash generator functionality.
    
    Run with: python supplychain/hash_generator.py
    """
    import os
    import django
    
    # Setup Django for standalone testing
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
    django.setup()
    
    from supplychain.models import CropBatch
    
    print("=" * 60)
    print("Batch Hash Generator Test")
    print("=" * 60)
    
    try:
        # Get a batch to test with
        batch = CropBatch.objects.first()
        
        if not batch:
            print("❌ No batches found in database. Create a batch first.")
            exit(1)
        
        print(f"\n📦 Testing with Batch: {batch.product_batch_id}")
        print(f"   Crop Type: {batch.crop_type}")
        print(f"   Status: {batch.status}")
        print(f"   Quantity: {batch.quantity} kg")
        
        # Test 1: Generate hash
        print("\n🔐 Test 1: Generate Hash")
        hash_bytes = generate_batch_hash(batch)
        print(f"   Hash (bytes): {hash_bytes}")
        print(f"   Hash (hex): {hash_to_hex(hash_bytes)}")
        print(f"   Length: {len(hash_bytes)} bytes ✓")
        
        # Test 2: Verify determinism (same data = same hash)
        print("\n🔄 Test 2: Verify Determinism")
        hash2 = generate_batch_hash(batch)
        if hash_bytes == hash2:
            print("   ✓ Hash is deterministic (same data = same hash)")
        else:
            print("   ✗ Hash is NOT deterministic!")
        
        # Test 3: Validate hash format
        print("\n✅ Test 3: Validate Hash Format")
        if validate_hash_format(hash_bytes):
            print("   ✓ Hash is valid bytes32 format")
        else:
            print("   ✗ Hash format is invalid")
        
        # Test 4: Hex conversion roundtrip
        print("\n🔄 Test 4: Hex Conversion Roundtrip")
        hex_str = hash_to_hex(hash_bytes)
        recovered_hash = hex_to_hash(hex_str)
        if recovered_hash == hash_bytes:
            print("   ✓ Hex conversion roundtrip successful")
        else:
            print("   ✗ Hex conversion failed")
        
        # Test 5: Show canonical data
        print("\n📝 Test 5: Canonical Data (first 500 chars)")
        canonical_data = generate_canonical_data(batch)
        canonical_json = json.dumps(canonical_data, sort_keys=True, separators=(',', ':'))
        print(f"   {canonical_json[:500]}...")
        
        print("\n" + "=" * 60)
        print("All tests completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
