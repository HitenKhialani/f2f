import os
import django
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

User = get_user_model()

def get_admin_token():
    # Try to find a user who is an admin
    # Based on models, we need a StakeholderProfile with role='ADMIN'
    from supplychain.models import StakeholderProfile, StakeholderRole
    
    admin_profile = StakeholderProfile.objects.filter(role=StakeholderRole.ADMIN).first()
    
    if not admin_profile:
        print("No Admin profile found. Trying to find any user.")
        user = User.objects.first()
    else:
        user = admin_profile.user
        
    if not user:
        print("No users found in database.")
        return

    refresh = RefreshToken.for_user(user)
    print(f"TOKEN={str(refresh.access_token)}")

if __name__ == "__main__":
    get_admin_token()
