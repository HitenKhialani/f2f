from supplychain.blockchain_views import VerifyBatchView
from supplychain.models import CropBatch
from rest_framework.test import APIRequestFactory
import json

batch = CropBatch.objects.first()
if not batch:
    print("No batch found")
else:
    factory = APIRequestFactory()
    request = factory.get(f'/api/batch/{batch.product_batch_id}/verify/')
    view = VerifyBatchView.as_view()
    response = view(request, batch_id=batch.product_batch_id)
    print("JSON_RESPONSE_START")
    print(json.dumps(response.data, indent=2))
    print("JSON_RESPONSE_END")
