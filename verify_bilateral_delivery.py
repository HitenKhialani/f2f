import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'Backend', 'bsas_supplychain-main'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.models import CropBatch, StakeholderProfile, BatchStatus, TransportRequest, StakeholderRole
from django.contrib.auth.models import User
from django.utils import timezone
from supplychain.batch_validators import BatchStatusTransitionValidator

def verify_bilateral_verification():
    print("Starting verification of Bilateral Delivery Verification flow...")
    
    # 1. Setup participants
    farmer_user = User.objects.get(username='farmer01')
    transporter_user = User.objects.get(username='transporter01')
    distributor_user = User.objects.get(username='distributor01')
    
    farmer_profile = farmer_user.stakeholderprofile
    transporter_profile = transporter_user.stakeholderprofile
    distributor_profile = distributor_user.stakeholderprofile
    
    # 2. Create Batch
    batch = CropBatch.objects.create(
        farmer=farmer_profile,
        crop_type="Verification Wheat",
        quantity=500.0,
        harvest_date=timezone.now().date(),
        status=BatchStatus.CREATED,
        current_owner=farmer_user
    )
    print(f"Created batch {batch.product_batch_id} in status {batch.status}")
    
    # 3. Request Transport
    batch.status = BatchStatus.TRANSPORT_REQUESTED
    batch.save()
    tr = TransportRequest.objects.create(
        batch=batch,
        requested_by=farmer_profile,
        from_party=farmer_profile,
        to_party=distributor_profile,
        status='PENDING'
    )
    print(f"Transport requested to Distributor. TR-ID: {tr.id}")
    
    # 4. Accept Transport (Transporter)
    tr.transporter = transporter_profile
    tr.status = 'ACCEPTED'
    tr.save()
    batch.status = BatchStatus.IN_TRANSIT_TO_DISTRIBUTOR
    batch.save()
    print(f"Transporter accepted. Status: {batch.status}")
    
    # 5. Verify ARRIVE (Transporter)
    # Simulate API call to Arrive
    batch.status = BatchStatus.ARRIVED_AT_DISTRIBUTOR
    tr.status = 'ARRIVED'
    batch.save()
    tr.save()
    print(f"Transporter marked ARRIVED. Status: {batch.status}")
    
    # 6. Verify CONFIRM ARRIVAL (Receiver - Distributor)
    # Check if Transporter can mark DELIVERED NOW (Should FAIL validator)
    can, err = BatchStatusTransitionValidator.can_transition(batch, transporter_user, BatchStatus.DELIVERED_TO_DISTRIBUTOR)
    if not can:
        print(f"EXPECTED FAILURE: Transporter cannot mark delivered yet. Error: {err}")
    else:
        print("FAILURE: Transporter was wrongly allowed to mark delivered before confirmation")
        return False
        
    # Receiver confirms arrival
    batch.status = BatchStatus.ARRIVAL_CONFIRMED_BY_DISTRIBUTOR
    tr.status = 'ARRIVAL_CONFIRMED'
    batch.save()
    tr.save()
    print(f"Receiver (Distributor) confirmed arrival. Status: {batch.status}")
    
    # 7. Final Delivery (Transporter)
    can, err = BatchStatusTransitionValidator.can_transition(batch, transporter_user, BatchStatus.DELIVERED_TO_DISTRIBUTOR)
    if can:
        print("SUCCESS: Transporter can now mark delivered.")
        batch.status = BatchStatus.DELIVERED_TO_DISTRIBUTOR
        batch.current_owner = distributor_user
        tr.status = 'DELIVERED'
        batch.save()
        tr.save()
        print(f"Final status: {batch.status}, Owner: {batch.current_owner.username}")
    else:
        print(f"FAILURE: Transporter should be allowed to deliver now. Error: {err}")
        return False

    print("\nAll Bilateral Delivery Verification logic PASSED!")
    return True

if __name__ == "__main__":
    success = verify_bilateral_verification()
    if not success:
        sys.exit(1)
