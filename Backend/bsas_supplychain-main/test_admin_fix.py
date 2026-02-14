import os
import django
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

from supplychain.admin_views import KYCDecisionView
from supplychain import models
from django.contrib.auth import get_user_model

User = get_user_model()

def test_admin_approval_no_profile():
    # 1. Get or Create an Admin User (Superuser usually has no profile)
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("No superuser found. Creating one temporary...")
        admin_user = User.objects.create_superuser('temp_admin', 'temp@admin.com', 'password')

    # Ensure this user has NO profile (or temporarily rename it if they do, but let's assume they don't for this test case)
    # If they do, we can just delete it for the test and recreate? No, destructive.
    # New strategy: Create a fresh user without profile and mock them as request.user
    
    test_user = User.objects.create_user('test_admin_no_profile', 'test@no.com', 'pass')
    # Do NOT create a StakeholderProfile for them
    
    # 2. Get a KYC record to approve
    kyc = models.KYCRecord.objects.first()
    if not kyc:
        print("No KYC record found to test.")
        return

    print(f"Testing approval for KYC {kyc.id} by User {test_user.username} (Has Profile: {hasattr(test_user, 'stakeholderprofile')})")

    # 3. Simulate Request
    factory = APIRequestFactory()
    request = factory.post(f'/api/admin/kyc/decide/{kyc.id}/', {'decision': 'APPROVED', 'notes': 'Test approval'}, format='json')
    from rest_framework.test import force_authenticate
    force_authenticate(request, user=test_user)
    
    # 4. Call View
    view = KYCDecisionView.as_view()

    try:
        response = view(request, pk=kyc.id)
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {response.data}")
        if response.status_code == 200:
            print("SUCCESS: 500 Error Avoided!")
        else:
            print("FAILURE: Unexpected status code.")
    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")
        # Print traceback
        import traceback
        traceback.print_exc()
    
    # Cleanup
    test_user.delete()



# Execute immediately
test_admin_approval_no_profile()


