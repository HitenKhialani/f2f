
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.models import TransportRequest, StakeholderProfile

print("=== Stakeholder Profiles ===")
for profile in StakeholderProfile.objects.all():
    print(f"ID: {profile.id}, User: {profile.user.username}, Role: {profile.role}, Org: {profile.organization}")

print("\n=== Transport Requests (Arrived) ===")
arrived_requests = TransportRequest.objects.filter(status='ARRIVED')
for tr in arrived_requests:
    print(f"ID: {tr.id}, Batch: {tr.batch.product_batch_id}, From: {tr.from_party.organization}, To: {tr.to_party.organization}, Status: {tr.status}")

print("\n=== Transport Requests for retailer01 ===")
retailer01 = StakeholderProfile.objects.filter(user__username='retailer01').first()
if retailer01:
    tr_for_retailer = TransportRequest.objects.filter(to_party=retailer01)
    for tr in tr_for_retailer:
        print(f"ID: {tr.id}, Batch: {tr.batch.product_batch_id}, From: {tr.from_party.organization}, Status: {tr.status}")
else:
    print("User 'retailer01' not found.")
