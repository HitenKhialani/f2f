
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsas_supplychain.settings')
django.setup()

from django.contrib.auth import get_user_model
from supplychain.models import TransportRequest, StakeholderProfile

with open('debug_links.txt', 'w') as f:
    f.write("=== User and Profile for retailer01 ===\n")
    User = get_user_model()
    try:
        u = User.objects.get(username='retailer01')
        f.write(f"User ID: {u.id}, Username: {u.username}\n")
        try:
            p = u.stakeholderprofile
            f.write(f"Profile ID: {p.id}, Role: {p.role}, Org: '{p.organization}'\n")
        except:
            f.write("Profile NOT FOUND via u.stakeholderprofile\n")
    except User.DoesNotExist:
        f.write("User retailer01 NOT FOUND\n")

    f.write("\n=== Transport Request 14 Details ===\n")
    try:
        tr = TransportRequest.objects.get(id=14)
        f.write(f"TR ID: {tr.id}, Status: {tr.status}\n")
        f.write(f"To Party Profile ID: {tr.to_party.id}\n")
        f.write(f"To Party User ID: {tr.to_party.user.id}\n")
        f.write(f"To Party Username: {tr.to_party.user.username}\n")
    except TransportRequest.DoesNotExist:
        f.write("TR 14 NOT FOUND\n")

    f.write("\n=== Query Test ===\n")
    if 'u' in locals():
        profile = u.stakeholderprofile
        from django.db.models import Q
        qs = TransportRequest.objects.filter(
            Q(requested_by=profile) | 
            Q(from_party=profile) | 
            Q(to_party=profile)
        ).distinct()
        f.write(f"Query found {qs.count()} requests for profile {profile.id}\n")
        for item in qs:
            f.write(f"- TR {item.id} status {item.status}\n")
