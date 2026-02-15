from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from . import models


class BatchTraceView(APIView):
    """
    Public API to trace batch history for consumers.
    Returns complete supply chain journey.
    """
    permission_classes = []  # Public endpoint
    
    def get(self, request, batch_id):
        # Get batch by product_batch_id (the public ID)
        try:
            batch = models.CropBatch.objects.select_related(
                'farmer__user',
                'current_owner'
            ).get(product_batch_id=batch_id)
        except models.CropBatch.DoesNotExist:
            return Response(
                {"success": False, "message": "Batch not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Build timeline
        timeline = []
        
        # 1. Crop Production (Batch Created)
        timeline.append({
            "stage": "Crop Production",
            "status": "completed",
            "date": batch.created_at.isoformat(),
            "actor": batch.farmer.user.username,
            "actor_type": "Farmer",
            "location": batch.farm_location or "N/A",
            "details": {
                "crop_type": batch.crop_type,
                "quantity": str(batch.quantity),
                "harvest_date": batch.harvest_date.isoformat(),
            }
        })
        
        # 2. Transport
        transport_requests = models.TransportRequest.objects.filter(
            batch=batch
        ).select_related('transporter__user', 'from_party__user', 'to_party__user').order_by('created_at')
        
        for transport in transport_requests:
            timeline.append({
                "stage": "Transport",
                "status": transport.status,
                "date": transport.created_at.isoformat(),
                "actor": transport.transporter.user.username if transport.transporter else "Pending",
                "actor_type": "Transporter",
                "location": f"{transport.from_party.organization or 'Origin'} → {transport.to_party.organization or 'Destination'}",
                "details": {
                    "from": transport.from_party.user.username,
                    "to": transport.to_party.user.username,
                    "status": transport.status,
                }
            })
        
        # 3. Inspection
        inspections = models.InspectionReport.objects.filter(
            batch=batch
        ).select_related('distributor__user').order_by('inspected_at')
        
        for inspection in inspections:
            timeline.append({
                "stage": "Quality Inspection",
                "status": "passed" if inspection.passed else "failed",
                "date": inspection.inspected_at.isoformat(),
                "actor": inspection.distributor.user.username,
                "actor_type": "Distributor",
                "location": inspection.distributor.organization or "Distribution Center",
                "details": {
                    "passed": inspection.passed,
                    "storage_conditions": inspection.storage_conditions,
                }
            })
        
        # 4. Retail Listing
        listings = models.RetailListing.objects.filter(
            batch=batch
        ).select_related('retailer__user').order_by('created_at')
        
        for listing in listings:
            timeline.append({
                "stage": "Retail Sale",
                "status": listing.status if hasattr(listing, 'status') else "for_sale",
                "date": listing.created_at.isoformat(),
                "actor": listing.retailer.user.username,
                "actor_type": "Retailer",
                "location": listing.retailer.organization or "Retail Store",
                "details": {
                    "price": float(
                        listing.farmer_base_price + 
                        listing.transport_fees + 
                        listing.distributor_margin + 
                        listing.retailer_margin
                    ),
                    "price_breakdown": {
                        "farmer_base": float(listing.farmer_base_price),
                        "transport": float(listing.transport_fees),
                        "distributor_margin": float(listing.distributor_margin),
                        "retailer_margin": float(listing.retailer_margin),
                    }
                }
            })
        
        # Build response
        response_data = {
            "success": True,
            "batch": {
                "id": batch.product_batch_id,
                "crop_type": batch.crop_type,
                "quantity": str(batch.quantity),
                "harvest_date": batch.harvest_date.isoformat(),
                "status": batch.status,
                "current_owner": batch.current_owner.username if batch.current_owner else None,
            },
            "farmer": {
                "name": batch.farmer.user.username,
                "organization": batch.farmer.organization,
                "location": batch.farm_location,
            },
            "timeline": timeline,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
