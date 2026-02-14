from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from supplychain.models import StakeholderProfile, StakeholderRole

User = get_user_model()

def get_admin_token():
    print("Finding Admin User...")
    admin_profile = StakeholderProfile.objects.filter(role=StakeholderRole.ADMIN).first()
    
    user = None
    if admin_profile:
        print(f"Found Admin Profile for user: {admin_profile.user.username}")
        user = admin_profile.user
    else:
        print("No Admin profile found. Trying to find any user.")
        user = User.objects.first()
    
    if not user:
        print("No users found.")
        return

    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    
    with open("token.txt", "w") as f:
        f.write(token)
    print(f"Token written to token.txt")

get_admin_token()
