
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from supplychain.models import TransportRequest, StakeholderProfile

with open('debug_output.txt', 'w') as f:
    f.write("=== Stakeholder Profiles ===\n")
    for profile in StakeholderProfile.objects.all():
        f.write(f"ID: {profile.id}, User: {profile.user.username}, Role: {profile.role}, Org: {profile.organization}\n")

    f.write("\n=== Transport Requests (Arrived) ===\n")
    arrived_requests = TransportRequest.objects.filter(status='ARRIVED')
    for tr in arrived_requests:
        f.write(f"ID: {tr.id}, Batch: {tr.batch.product_batch_id}, From: {tr.from_party.organization}, To: {tr.to_party.organization}, Status: {tr.status}\n")

    f.write("\n=== Transport Requests for retailer01 ===\n")
    retailer01 = StakeholderProfile.objects.filter(user__username='retailer01').first()
    if retailer01:
        tr_for_retailer = TransportRequest.objects.filter(to_party=retailer01)
        for tr in tr_for_retailer:
            f.write(f"ID: {tr.id}, Batch: {tr.batch.product_batch_id}, From: {tr.from_party.organization}, Status: {tr.status}\n")
    else:
        f.write("User 'retailer01' not found.\n")
