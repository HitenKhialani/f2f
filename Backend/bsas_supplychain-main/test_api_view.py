import os
import django
import json
from rest_framework.test import APIRequestFactory

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.blockchain_views import VerifyBatchView
from supplychain.models import CropBatch
from supplychain.blockchain_service import get_blockchain_service

def run_test():
    batch = CropBatch.objects.first()
    if not batch:
        print("No batch found.")
        return
        
    print(f"Testing VerifyBatchView for batch {batch.product_batch_id}")
    factory = APIRequestFactory()
    request = factory.get(f'/api/batch/{batch.product_batch_id}/verify/')
    
    view = VerifyBatchView.as_view()
    response = view(request, batch_id=batch.product_batch_id)
    
    print("\nAPI Response Status Code:", response.status_code)
    print("\nAPI Response JSON:")
    print(json.dumps(response.data, indent=2))
    
    assert response.data.get('status') != 'error', f"API returned error: {response.data.get('error')}"
    print("\nTest passed. No 'error' status.")

if __name__ == "__main__":
    run_test()
