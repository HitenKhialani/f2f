
import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.views import TransportRequestViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.request import Request

User = get_user_model()
user = User.objects.get(username='retailer01')

factory = APIRequestFactory()
raw_request = factory.get('/api/transport-requests/')
force_authenticate(raw_request, user=user)

# Wrap in DRF Request object
drf_request = Request(raw_request)

viewset = TransportRequestViewSet()
viewset.request = drf_request
viewset.format_kwarg = None

# Manually call the method
qs = viewset.get_queryset()

with open('debug_viewset_v2.txt', 'w') as f:
    f.write(f"User: {user.username}\n")
    f.write(f"Queryset count: {qs.count()}\n")
    for tr in qs:
        f.write(f"TR-{tr.id} status: {tr.status}, To: {tr.to_party.user.username}\n")
