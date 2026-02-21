# Integration Testing Guide

## Overview
This guide provides step-by-step instructions to test the complete supply chain workflow from Farmer to Consumer.

---

## Prerequisites

### Backend Setup
```bash
cd Backend/bsas_supplychain-main
python manage.py runserver
```

### Frontend Setup
```bash
cd Frontend/agri-supply-chain
npm run dev
```

### Test Users Required
You need users with the following roles (create via Admin panel if needed):
- **Farmer** (KYC Approved)
- **Transporter** (KYC Approved)
- **Distributor** (KYC Approved)
- **Retailer** (KYC Approved)
- **Consumer** (Any status)

---

## Test Flow 1: Complete Supply Chain Journey

### Step 1: Farmer Creates Batch
**Login as:** Farmer

1. Navigate to Farmer Dashboard
2. Click "Create New Batch"
3. Fill in:
   - Crop Type: `Wheat`
   - Quantity: `1000`
   - Harvest Date: Today's date
   - Farm Location: `Punjab, India`
4. Submit
5. **Verify:**
   - ✅ Batch appears in table with status `CREATED`
   - ✅ Batch has unique `product_batch_id`
   - ✅ Current owner is the farmer

**Expected Event Log:** `CREATED`

---

### Step 2: Farmer Requests Transport
**Login as:** Farmer

1. Find the batch you created
2. Click "Request Transport" button
3. Select a Distributor from dropdown
4. Submit
5. **Verify:**
   - ✅ Batch status changes to `TRANSPORT_REQUESTED`
   - ✅ Success message displayed
   - ✅ Status badge updates in table

**Expected Event Log:** `CREATED`, `TRANSPORT_REQUESTED`

---

### Step 3: Transporter Accepts Request
**Login as:** Transporter

1. Navigate to Transporter Dashboard
2. Find the pending transport request
3. Click "Accept" button
4. **Verify:**
   - ✅ Request status changes to `accepted`
   - ✅ Batch status changes to `IN_TRANSIT`
   - ✅ Success message displayed

**Expected Event Log:** `CREATED`, `TRANSPORT_REQUESTED`, `TRANSPORT_ACCEPTED`

---

### Step 4: Transporter Marks Delivery
**Login as:** Transporter

1. Find the accepted request
2. Click "Mark Delivered" button
3. **Verify:**
   - ✅ Request status changes to `delivered`
   - ✅ Batch status changes to `RECEIVED_BY_DISTRIBUTOR`
   - ✅ Current owner changes to Distributor

**Expected Event Log:** `CREATED`, `TRANSPORT_REQUESTED`, `TRANSPORT_ACCEPTED`, `DELIVERED`

---

### Step 5: Distributor Inspects Batch
**Login as:** Distributor

1. Navigate to Distributor Dashboard
2. Find the received batch
3. Click "Inspect" button
4. Fill in inspection form:
   - Storage Conditions: `Temperature controlled, 15-20°C`
   - Result: Select "Passed"
5. Submit
6. **Verify:**
   - ✅ Batch status changes to `INSPECTED`
   - ✅ Inspection report created
   - ✅ Redirected to dashboard

**Expected Event Log:** `CREATED`, `TRANSPORT_REQUESTED`, `TRANSPORT_ACCEPTED`, `DELIVERED`, `INSPECTED`

---

### Step 6: Retailer Creates Listing
**Login as:** Retailer

1. Navigate to Retailer Dashboard
2. Click "New Listing"
3. Select the inspected batch
4. Fill in pricing:
   - Farmer Base Price: `5000`
   - Transport Fees: `500`
   - Distributor Margin: `300`
   - Retailer Margin: `200`
5. **Verify:**
   - ✅ Total price calculated: `₹6000`
6. Submit
7. **Verify:**
   - ✅ Listing created successfully
   - ✅ Batch status changes to `LISTED_FOR_RETAIL`
   - ✅ Listing appears in dashboard

**Expected Event Log:** `CREATED`, `TRANSPORT_REQUESTED`, `TRANSPORT_ACCEPTED`, `DELIVERED`, `INSPECTED`, `LISTED`

---

### Step 7: Consumer Traces Batch
**Login as:** Consumer (or use public trace page)

1. Navigate to Consumer Dashboard
2. Enter the `product_batch_id` from Step 1
3. Click "Search"
4. **Verify:**
   - ✅ Batch details displayed
   - ✅ Farmer information shown
   - ✅ Complete timeline visible with all stages:
     - Crop Production (Farmer)
     - Transport (Transporter)
     - Quality Inspection (Distributor)
     - Retail Sale (Retailer)
   - ✅ All dates and actors correct
   - ✅ No mock data

---

## Test Flow 2: Edge Cases & Validation

### Test 2.1: Invalid Status Transition
**Login as:** Retailer

1. Try to create listing for a batch with status `CREATED` (not inspected)
2. **Expected:** Error message or batch not available in dropdown

### Test 2.2: Unauthorized Action
**Login as:** Farmer

1. Try to access `/distributor/inspection/:id` directly
2. **Expected:** Redirect or 403 error

### Test 2.3: Non-existent Batch Trace
**Login as:** Consumer

1. Enter invalid batch ID: `INVALID-123`
2. Click "Search"
3. **Expected:** Error message "Batch not found"

---

## Backend Verification

### Check Event Logs (Django Shell)
```python
python manage.py shell

from supplychain.models import CropBatch, BatchEvent

# Get your batch
batch = CropBatch.objects.get(product_batch_id='BATCH-20260214-XXXXXXXX')

# View all events
events = batch.events.all()
for event in events:
    print(f"{event.timestamp} - {event.event_type} by {event.performed_by.username}")
```

**Expected Output:**
```
2026-02-14 16:00:00 - CREATED by farmer_user
2026-02-14 16:05:00 - TRANSPORT_REQUESTED by farmer_user
2026-02-14 16:10:00 - TRANSPORT_ACCEPTED by transporter_user
2026-02-14 16:15:00 - DELIVERED by transporter_user
2026-02-14 16:20:00 - INSPECTED by distributor_user
2026-02-14 16:25:00 - LISTED by retailer_user
```

---

## API Testing (Optional)

### Test Trace API Directly
```bash
curl http://localhost:8000/api/consumer/trace/BATCH-20260214-XXXXXXXX/
```

**Expected Response:**
```json
{
  "success": true,
  "batch": {
    "id": "BATCH-20260214-XXXXXXXX",
    "crop_type": "Wheat",
    "quantity": "1000",
    "status": "LISTED_FOR_RETAIL"
  },
  "farmer": {
    "name": "farmer_user",
    "organization": "...",
    "location": "Punjab, India"
  },
  "timeline": [...]
}
```

---

## Success Criteria

All tests pass if:
- ✅ Complete flow works without errors
- ✅ Status transitions follow the correct order
- ✅ Event logs are created at each step
- ✅ Ownership transfers correctly
- ✅ Consumer can trace the complete journey
- ✅ No mocked data appears
- ✅ All UI routes work
- ✅ Error handling works for edge cases

---

## Known Issues / Limitations

1. **Inspection Backend:** May need to update batch status after inspection submission
2. **Retail Listing:** May need to update batch status after listing creation
3. **Multiple Transporters:** Currently first-come-first-serve, no bidding system

---

## Next Steps After Testing

If all tests pass:
1. ✅ Mark Phase 6 complete
2. 🚀 Ready for Blockchain Integration
3. 📝 Document any bugs found
4. 🔧 Fix critical issues before blockchain work
