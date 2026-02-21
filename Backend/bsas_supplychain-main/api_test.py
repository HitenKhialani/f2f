
import os
import django
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

User = get_user_model()
user = User.objects.get(username='retailer01')

client = APIClient()
client.force_authenticate(user=user)

response = client.get('/api/transport-requests/')
print(f"Status Code: {response.status_code}")
print(f"Number of items: {len(response.data) if isinstance(response.data, list) else 'Not a list'}")

if isinstance(response.data, list):
    for item in response.data:
        print(f"TR-{item['id']} status: {item['status']}")
else:
    print(response.data)
