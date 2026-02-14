import os
import django
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

from supplychain.admin_views import UserListView
from supplychain.auth_views import LoginView
from supplychain import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def verify_refinements():
    with open("verification_log.txt", "w") as log:
        def log_print(msg):
            print(msg)
            log.write(msg + "\n")

        log_print("--- Verifying Admin Panel Refinements ---")

        # 1. Test Superuser Login (Auto-Profile Creation)
        log_print("\n1. Testing Superuser Login Auto-Profile Creation...")

        superuser_email = "super@test.com"
        superuser_pass = "pass1234"
        
        # Ensure cleanup
        User.objects.filter(email=superuser_email).delete()
        
        # Create superuser without profile
        su = User.objects.create_superuser("superuser_test", superuser_email, superuser_pass)
        # Confirm no profile initially
        try:
            p = models.StakeholderProfile.objects.get(user=su)
            log_print("WARNING: Superuser already has profile. Deleting it to test auto-creation.")
            p.delete()
        except models.StakeholderProfile.DoesNotExist:
            log_print("Confirmed: Superuser has no profile initially.")

        # Call Login View
        factory = APIRequestFactory()
        request = factory.post('/api/auth/login/', {'email': superuser_email, 'password': superuser_pass}, format='json')
        view = LoginView.as_view()
        response = view(request)
        
        if response.status_code == 200:
            log_print("SUCCESS: Login successful.")
            # Check if profile created
            try:
                p = models.StakeholderProfile.objects.get(user=su)
                log_print(f"SUCCESS: Profile auto-created. Role: {p.role}, KYC: {p.kyc_status}")
            except models.StakeholderProfile.DoesNotExist:
                log_print("FAILURE: Profile was NOT created.")
        else:
            log_print(f"FAILURE: Login failed with status {response.status_code}. Data: {response.data}")

        # 2. Test User List Filtering
        log_print("\n2. Testing User List Filtering (Hide Admins)...")
        
        # Create a regular farmer user
        farmer_email = "farmer@testrefine.com"
        User.objects.filter(email=farmer_email).delete()
        farmer_user = User.objects.create_user("farmer_test_refine", farmer_email, "pass1234")
        models.StakeholderProfile.objects.create(user=farmer_user, role=models.StakeholderRole.FARMER)
        
        # We have 'su' (Admin) and 'farmer_user' (Farmer)
        
        # Request User List as Admin
        request = factory.get('/api/admin/users/')
        force_authenticate(request, user=su)
        view = UserListView.as_view()
        response = view(request)
        
        if response.status_code == 200:
            data = response.data
            log_print(f"User List Count: {len(data)}")
            
            found_admin = any(u['username'] == 'superuser_test' for u in data)
            found_farmer = any(u['username'] == 'farmer_test_refine' for u in data)
            
            if not found_admin:
                log_print("SUCCESS: Superuser is HIDDEN from list.")
            else:
                log_print("FAILURE: Superuser matches found in list.")
                
            if found_farmer:
                log_print("SUCCESS: Farmer is VISIBLE in list.")
                # Verify nested data
                farmer_entry = next(u for u in data if u['username'] == 'farmer_test_refine')
                if 'stakeholderprofile' in farmer_entry and farmer_entry['stakeholderprofile']['role'] == 'farmer':
                     log_print("SUCCESS: Farmer has correct nested profile data.")
                else:
                     log_print(f"FAILURE: Farmer data structure mismatch. Content: {farmer_entry}")

            else:
                log_print("FAILURE: Farmer NOT found in list.")
                
        else:
            log_print(f"FAILURE: User List API failed {response.status_code}")

        # Cleanup
        su.delete()
        farmer_user.delete()


# Execute
verify_refinements()
