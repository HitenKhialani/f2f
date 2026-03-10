import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.models import CropBatch, StakeholderProfile, BatchEventType, IntegrityStatus, BatchIntegrityLog
from supplychain.event_logger import log_batch_event
from supplychain.blockchain_service import get_blockchain_service
import datetime

def run_test():
    print("Starting Integrity Verification Test...")
    farmer_profile = StakeholderProfile.objects.filter(role='farmer').first()
    if not farmer_profile:
        print("No farmer profile found. Cannot run test.")
        return

    # 1. Create a dummy batch
    batch = CropBatch.objects.create(
        farmer=farmer_profile,
        crop_type="Test Apples",
        quantity=100.0,
        harvest_date=datetime.date.today(),
        farmer_base_price_per_unit=15.0,
        farm_location="Test Farm 1"
    )
    print(f"Created batch {batch.product_batch_id}")

    # 2. Log creation event (anchors to blockchain in background, but we'll mock it or let it fail if no keys)
    # We pass anchor_to_blockchain=False to avoid actually hitting polygon Amoy testnet for this test script,
    # but we will manually fill the blockchain_tx_hash to simulate a successful anchor.
    event = log_batch_event(batch, BatchEventType.CREATED, farmer_profile.user, anchor_to_blockchain=False)
    
    # Simulate successful anchoring
    from supplychain.hash_generator import generate_batch_hash
    recomputed = generate_batch_hash(batch, event.event_type, 1, farmer_profile.user.id)
    event.blockchain_tx_hash = "0xsimulated_tx_hash"
    event.snapshot_hash = recomputed.hex()
    event.save()
    
    batch.is_blockchain_verified = True
    batch.save()
    print(f"Simulated anchoring CRITICAL event. Original Hash: {event.snapshot_hash}")

    blockchain_service = get_blockchain_service()
    
    # 3. Verify integrity (should pass)
    print("\nVerifying integrity (Before Tampering)...")
    res1 = blockchain_service.verify_batch_integrity(batch)
    print(f"Result: {res1['verified']} - {res1['message']}")
    
    batch.refresh_from_db()
    print(f"Batch Integrity Status: {batch.integrity_status}")

    # 4. Tamper with the database! (Admin changes price)
    print("\nTAMPERING WITH DATABASE... (Changing basic price from 15 to 30)")
    CropBatch.objects.filter(id=batch.id).update(farmer_base_price_per_unit=30.0)
    batch.refresh_from_db()
    
    # 5. Verify integrity (should fail)
    print("\nVerifying integrity (After Tampering)...")
    res2 = blockchain_service.verify_batch_integrity(batch)
    print(f"Result: {res2['verified']} - {res2['message']}")
    
    batch.refresh_from_db()
    print(f"Batch Integrity Status: {batch.integrity_status}")
    
    # 6. Check logs
    logs = BatchIntegrityLog.objects.filter(batch=batch)
    print(f"\nIntegrity Logs created: {logs.count()}")
    for log in logs:
        print(f"  - {log.event_type} Mismatch! Expected: {log.blockchain_hash[:10]}... Got: {log.recomputed_hash[:10]}...")

if __name__ == '__main__':
    run_test()
