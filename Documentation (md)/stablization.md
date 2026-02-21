PHASE 1 – Define and Enforce Batch Lifecycle (CRITICAL)
Goal:

Create a clear state machine for CropBatch.

1.1 Add Explicit Ownership Tracking (Backend)

Add current_owner field in CropBatch model (ForeignKey to User).

Add status field in CropBatch:

CREATED

TRANSPORT_REQUESTED

IN_TRANSIT

RECEIVED_BY_DISTRIBUTOR

INSPECTED

LISTED_FOR_RETAIL

SOLD

Write migration.

Ensure batch creation automatically sets:

current_owner = farmer

status = CREATED

1.2 Enforce Status Transitions (Backend)

Create service-level validation:

Farmer can only:

Create batch

Initiate transport

Distributor can only:

Receive batch (if IN_TRANSIT)

Create inspection (if RECEIVED)

Retailer can only:

Create listing (if INSPECTED)

Reject invalid transitions with 400 response.

PHASE 2 – Fix Broken Workflows
2.1 Farmer → Transport Flow
Backend

Create API endpoint:
POST /transport/request/

Input: batch_id, distributor_id

Set batch status → TRANSPORT_REQUESTED

On transporter acceptance:

Update batch status → IN_TRANSIT

On delivery confirmation:

Update batch:

current_owner = distributor

status = RECEIVED_BY_DISTRIBUTOR

Frontend

Add "Request Transport" button in Farmer Dashboard.

Create Transport Request Modal.

Show batch status column in Farmer batch list.

Update UI dynamically after status change.

2.2 Fix Distributor Inspection Route
Frontend

Register missing route in App.jsx:
/distributor/inspection/:id

Create Inspection Page:

Fetch batch

Submit inspection result

On success:

Update batch status → INSPECTED

Backend

Ensure InspectionReport API updates batch status after creation.

Validate only distributor who received batch can inspect.

2.3 Retailer Listing Flow
Frontend

Register route:
/retailer/listing/new

Create Listing Form:

Select inspected batch

Enter price

Submit listing

After success:

Batch status → LISTED_FOR_RETAIL

Backend

Ensure only INSPECTED batches can be listed.

Update batch ownership if needed.

PHASE 3 – Consumer Traceability (Remove Mock)
3.1 Create Real Trace API
Backend

Create:
GET /consumer/trace/:batch_id

Response must include:

Farmer info

Harvest date

Transport history

Inspection result

Retail listing info

Status history (timeline format)

3.2 Frontend

Replace mocked data.

Connect search to real API.

Render dynamic timeline.

PHASE 4 – Batch History Logging (Blockchain Preparation)
4.1 Add BatchEvent Model

Backend:

Create model:
BatchEvent

Fields:

batch

event_type

performed_by

timestamp

metadata (JSON)

Event Types:

CREATED

TRANSPORT_REQUESTED

TRANSPORT_ACCEPTED

DELIVERED

INSPECTED

LISTED

SOLD

Every status change MUST create a BatchEvent record.

This becomes your future blockchain mirror.

PHASE 5 – API and Integration Cleanup
5.1 Remove Hardcoded Data

Delete all mocked consumer timeline data.

Remove unused placeholders.

5.2 Fix Data Mismatch

Add farm_location field in CropBatch model (frontend already sending).

Ensure serializer includes it.

Run migration.

5.3 Standardize Error Responses

All APIs must return:

{
  success: false,
  message: "Explanation",
  errors: {...}
}

No random error shapes.

PHASE 6 – Integration Testing Checklist

Test each workflow manually:

6.1 Farmer

Create batch

Request transport

See status update

6.2 Transporter

Accept request

Mark as delivered

6.3 Distributor

Receive batch

Inspect batch

6.4 Retailer

Create listing

6.5 Consumer

Trace batch

View real timeline

All must work without manual DB edits.

PHASE 7 – Blockchain Readiness Verification

Before starting smart contracts, confirm:

 Batch has explicit owner field

 Status transitions enforced

 History logging implemented

 No mocked flows

 All routes registered

 No broken UI links

 End-to-end flow works

If any unchecked → DO NOT START BLOCKCHAIN.

FINAL ARCHITECTURE AFTER STABILIZATION

Frontend
↓
DRF API
↓
Relational DB
↓
BatchEvent timeline

Only after this is stable:

Add Smart Contract:

registerBatch

transferOwnership

logEventHash

PRIORITY ORDER (STRICT)

Ownership + Status fields

Transport request creation

Distributor inspection route

Retailer listing route

Consumer real trace API

BatchEvent logging

Final integration testing

No deviation.