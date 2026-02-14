
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

from django.contrib.auth import get_user_model
from supplychain.models import StakeholderProfile, KYCRecord, KYCStatus

User = get_user_model()

def verify_profiles():
    with open("profile_verify.log", "w") as f:
        f.write("Verifying User Profiles and KYC Status...\n")
        users = User.objects.all()
        
        for user in users:
            f.write(f"\nUser: {user.username} (ID: {user.id})\n")
            if user.is_superuser:
                f.write("  - Superuser (Admin)\n")
            
            try:
                profile = user.stakeholderprofile
                f.write(f"  - Profile Found: Role={profile.role}, KYC={profile.kyc_status}\n")
                
                # Check KYC Record match
                kyc_record = KYCRecord.objects.filter(profile=profile).last()
                if kyc_record:
                    verified_by = kyc_record.verified_by.username if kyc_record.verified_by else "None"
                    f.write(f"  - Latest KYC Record: Status={kyc_record.status}, Verified By={verified_by}\n")
                    if kyc_record.status.lower() != profile.kyc_status.lower() and profile.kyc_status != 'N/A':
                        f.write("  !!! MISMATCH: Profile KYC status does not match latest KYC Record status!\n")
                else:
                    f.write("  - No KYC Record found.\n")
                    
            except StakeholderProfile.DoesNotExist:
                f.write("  !!! NO PROFILE FOUND (This explains empty Role/Status if not Superuser)\n")

if __name__ == "__main__":
    verify_profiles()
