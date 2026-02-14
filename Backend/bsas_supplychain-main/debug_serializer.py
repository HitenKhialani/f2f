import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bsas_supplychain.settings")
django.setup()

from supplychain import models, serializers

def verify_kyc():
    # Get last KYC record
    record = models.KYCRecord.objects.last()
    if not record:
        print("No KYC Records found.")
        return

    serializer = serializers.KYCRecordSerializer(record)
    data = serializer.data
    
    print("\n--- Serializer Output ---")
    print(json.dumps(data, indent=2, default=str))
    
    if 'profile_details' in data:
        print("\nSUCCESS: 'profile_details' found in serializer output.")
        pd = data['profile_details']
        if 'user_details' in pd:
             print("SUCCESS: 'user_details' found in profile_details.")
             print(f"User: {pd['user_details'].get('username')}")
        else:
             print("FAILURE: 'user_details' MISSING in profile_details.")
    else:
        print("\nFAILURE: 'profile_details' MISSING in serializer output.")

if __name__ == "__main__":
    verify_kyc()
