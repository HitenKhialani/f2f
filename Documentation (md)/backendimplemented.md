# Backend Implementation Documentation – Agri Supply Chain System

## 1. Introduction

This document provides a **complete, end‑to‑end explanation of the backend** implemented for the Agri Supply Chain system. It is written to help **developers, teammates, reviewers, and future maintainers** clearly understand **what was built, why it was built, how it works internally, and where each component lives** in the repository.

The backend is designed using **Django + Django Rest Framework (DRF)** and models a real‑world agricultural supply chain involving **multiple stakeholders** (Farmer, Distributor, Transporter, Retailer, Consumer). Each stakeholder interacts with crop batches as they move from production to final consumption.

This document intentionally goes into **minute‑level detail**, including architectural decisions, data flow, API behavior, authentication logic, and repo organization.

---

## 2. Problem Statement & Purpose (WHY)

Traditional agricultural supply chains suffer from:
- Lack of transparency
- Poor traceability of food origin
- Manual, error‑prone record keeping
- No unified system connecting all stakeholders

### Why this backend exists

This backend solves those issues by:
- Digitally tracking **crop batches** across the entire lifecycle
- Enforcing **role‑based access** for each stakeholder
- Maintaining immutable historical records (inspection, transport, splits)
- Exposing standardized **REST APIs** for frontend, mobile apps, or QR scanning

The backend acts as the **single source of truth** for the supply chain.

---

## 3. High‑Level Architecture (WHAT)

### Tech Stack

| Layer | Technology |
|-----|-----------|
| Framework | Django 5.x |
| API | Django Rest Framework |
| Database | SQLite (dev) / PostgreSQL (prod‑ready) |
| Auth | Django Auth + DRF permissions |
| Admin | Django Admin |
| API Testing | Browser / Postman |

### Architecture Pattern

- **Monolithic Django Project**
- Modular Django Apps
- REST‑based communication
- Stateless API design

---

## 4. Stakeholders & Roles (WHO)

Each stakeholder has a **User Account + Stakeholder Profile**.

### Stakeholder Types

1. **Farmer**
   - Creates crop batches
   - Owns initial batch

2. **Distributor**
   - Accepts batches
   - Requests transport
   - Performs inspections
   - Stores inventory

3. **Transporter**
   - Moves goods between stakeholders
   - Updates transport status

4. **Retailer**
   - Accepts batches
   - Creates retail listings

5. **Consumer**
   - Scans QR / batch code
   - Views full supply chain history

Each role has **restricted permissions**, enforced at the API level.

---

## 5. Repository Structure (WHERE)

```
agri_supply_chain/
│
├── agri_supply_chain/          # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── supplychain/                # Core business logic
│   ├── models.py               # Database models
│   ├── serializers.py          # DRF serializers
│   ├── views.py                # ViewSets & APIs
│   ├── permissions.py          # Custom role permissions
│   ├── admin.py                # Admin configuration
│   └── apps.py
│
├── manage.py
├── requirements.txt
└── backendimplemented.md       # This document
```

---

## 6. Authentication & Authorization (HOW)

### User Model

- Uses Django’s default `User`
- Extended via `StakeholderProfile`

### StakeholderProfile Model

Stores:
- user (OneToOne)
- role (Farmer / Distributor / Transporter / Retailer)
- organization details

### Permissions

Custom DRF permissions ensure:
- Farmers cannot inspect
- Transporters cannot edit batches
- Consumers have read‑only access

This guarantees **real‑world enforcement** of business rules.

---

## 7. Core Data Models (WHAT EXACTLY)

### CropBatch

Represents the physical agricultural produce.

Fields:
- batch_id
- crop_type
- quantity
- origin
- current_owner
- status
- created_at

### TransportRequest

Tracks movement between stakeholders.

Fields:
- from_owner
- to_owner
- transporter
- status
- timestamps

### InspectionReport

Quality verification step.

Fields:
- inspector
- batch
- grade
- remarks
- approved

### BatchSplit

Allows partial batch division.

Used when:
- Distributor splits inventory
- Retailer sells portions

### RetailListing

Final consumer‑facing unit.

Fields:
- price
- quantity
- batch_reference

### ConsumerScan

Tracks traceability views.

---

## 8. API Design & Flow (HOW DATA MOVES)

All APIs are exposed under:

```
/api/
```

### Example Endpoints

| Endpoint | Purpose |
|--------|--------|
| /api/crop-batches/ | Create & view batches |
| /api/transport-requests/ | Move goods |
| /api/inspection-reports/ | Quality checks |
| /api/retail-listings/ | Consumer sale |
| /api/consumer-scans/ | View history |

---

## 9. End‑to‑End Supply Chain Flow (STEP BY STEP)

### Step 1: Farmer Creates Batch

- Authenticated farmer
- POST `/api/crop-batches/`
- Status: CREATED

### Step 2: Distributor Accepts Batch

- Ownership transferred
- Status updated

### Step 3: Transporter Moves Goods

- Transport request created
- Status transitions: REQUESTED → IN_TRANSIT → DELIVERED

### Step 4: Distributor Inspection

- Inspection report created
- Batch approved/rejected

### Step 5: Retailer Accepts Batch

- Ownership updated
- Inventory prepared

### Step 6: Retail Sale

- Retail listing created
- Partial or full batch sold

### Step 7: Consumer Views

- Consumer scans code
- Full traceability timeline returned

---

## 10. Django Admin Usage

Admin panel is used for:
- Manual verification
- Debugging
- Data inspection

Admin is **not** the main user interface — APIs are.

---

## 11. Error Handling & Validation

- Serializer validation
- Permission errors
- HTTP status codes
- Clear API responses

---

## 12. Development vs Production

| Aspect | Dev | Prod |
|----|----|----|
| DB | SQLite | PostgreSQL |
| Debug | On | Off |
| Auth | Basic | Token/JWT |

---

## 13. Future Improvements

- JWT authentication
- Blockchain ledger integration
- QR code generation
- Frontend dashboard
- Role‑specific UI

---

## 14. Conclusion

This backend is a **complete, role‑aware, traceable supply chain system**.

It is:
- Modular
- Scalable
- Real‑world aligned
- Easy to extend

Any developer joining this project should be able to:
- Understand data flow
- Add new features
- Debug issues confidently

---

**End of Document**

