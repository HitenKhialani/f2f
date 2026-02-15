from django.contrib.auth import get_user_model
from rest_framework import serializers

from supplychain import models

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)





class StakeholderProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = models.StakeholderProfile
        fields = ["id", "user", "user_details", "role", "phone", "wallet_id", "organization", "address", "kyc_status"]

class UserWithProfileSerializer(serializers.ModelSerializer):
    stakeholderprofile = StakeholderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined", "is_active", "stakeholderprofile"]



class KYCRecordSerializer(serializers.ModelSerializer):
    profile_details = StakeholderProfileSerializer(source="profile", read_only=True)

    class Meta:
        model = models.KYCRecord
        fields = [
            "id",
            "profile",
            "profile_details",
            "document_type",
            "document_number",
            "document_file",
            "status",
            "verified_by",
            "verified_at",
        ]



class CropBatchSerializer(serializers.ModelSerializer):
    current_owner_username = serializers.CharField(source="current_owner.username", read_only=True)
    
    class Meta:
        model = models.CropBatch
        fields = [
            "id",
            "farmer",
            "current_owner",
            "current_owner_username",
            "status",
            "farm_location",
            "crop_type",
            "quantity",
            "harvest_date",
            "organic_certificate",
            "quality_test_report",
            "product_batch_id",
            "qr_code_data",
            "created_at",
        ]
        read_only_fields = ["farmer", "product_batch_id", "qr_code_data", "created_at", "current_owner"]



class TransportRequestSerializer(serializers.ModelSerializer):
    batch_details = CropBatchSerializer(source="batch", read_only=True)
    from_party_details = StakeholderProfileSerializer(source="from_party", read_only=True)
    to_party_details = StakeholderProfileSerializer(source="to_party", read_only=True)
    transporter_details = StakeholderProfileSerializer(source="transporter", read_only=True)

    class Meta:
        model = models.TransportRequest
        fields = [
            "id",
            "batch",
            "batch_details",
            "requested_by",
            "from_party",
            "from_party_details",
            "to_party",
            "to_party_details",
            "transporter",
            "transporter_details",
            "status",
            "vehicle_details",
            "driver_details",
            "pickup_at",
            "delivered_at",
            "delivery_proof",
        ]


class InspectionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InspectionReport
        fields = [
            "id",
            "batch",
            "distributor",
            "report_file",
            "storage_conditions",
            "passed",
            "inspected_at",
        ]
        read_only_fields = ["inspected_at"]


class BatchSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.BatchSplit
        fields = ["id", "parent_batch", "split_label", "destination_retailer", "notes"]


class RetailListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RetailListing
        fields = [
            "id",
            "batch",
            "retailer",
            "farmer_base_price",
            "transport_fees",
            "distributor_margin",
            "retailer_margin",
            "is_for_sale",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class ConsumerScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ConsumerScan
        fields = ["id", "listing", "scanned_at", "note"]
        read_only_fields = ["scanned_at"]
