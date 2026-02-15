
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

from django.contrib.auth import get_user_model
from supplychain.models import CropBatch, StakeholderProfile

User = get_user_model()

def test_batch_lifecycle():
    print("Testing Batch Lifecycle Fields...")
    
    # Get a farmer
    farmer_profile = StakeholderProfile.objects.filter(role='farmer').first()
    
    if not farmer_profile:
        print("No farmer found. Please create a farmer first.")
        return
    
    print(f"\nFarmer: {farmer_profile.user.username}")
    
    # Create a test batch
    batch = CropBatch.objects.create(
        farmer=farmer_profile,
        crop_type="Test Wheat",
        quantity=100,
        harvest_date="2024-02-14",
        farm_location="Test Farm, Punjab"
    )
    
    print(f"\n✓ Created Batch: {batch.product_batch_id}")
    print(f"  - Status: {batch.status}")
    print(f"  - Current Owner: {batch.current_owner.username if batch.current_owner else 'None'}")
    print(f"  - Farm Location: {batch.farm_location}")
    
    # Verify defaults
    assert batch.status == "CREATED", f"Expected status CREATED, got {batch.status}"
    assert batch.current_owner == farmer_profile.user, f"Expected owner {farmer_profile.user.username}, got {batch.current_owner}"
    
    print("\n✓ All tests passed!")
    print(f"\nBatch ID to test in API: {batch.id}")

if __name__ == "__main__":
    test_batch_lifecycle()
