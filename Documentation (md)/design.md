
# design.md
## Frontend Design & Execution Specification (Stitch‑First, Backend‑Bound)
### Agri Supply Chain System – Final UI/UX Blueprint

---

## 1. Introduction & Intent

This document defines the **complete frontend design specification** for the Agri Supply Chain System.  
It is intentionally **long, explicit, and detailed**, because its purpose is not inspiration but **execution**.

This file must be treated as:
- A **design contract**
- A **frontend–backend alignment document**
- A **step‑by‑step guide for Stitch AI design creation**
- A **reference during React.js implementation**

No frontend screen should be designed, coded, or modified without checking this file.

The backend is already implemented and working. Therefore, the frontend design must:
- Respect backend data models
- Respect backend workflows and permissions
- Expose only what the backend allows
- Never introduce mismatched parameters

This document ensures that frontend, backend, and database evolve **together**, not independently.

---

## 2. System Philosophy

### 2.1 Backend as the Source of Truth

The backend defines:
- Who can do what
- When an action is allowed
- Which data exists
- How state transitions occur

The frontend **does not decide logic**.  
It only:
- Displays backend state
- Sends user intent to backend
- Reflects backend responses

This philosophy must guide every design decision.

---

### 2.2 Design Goals

The UI must feel:
- Professional
- Minimal
- Trust‑worthy
- Administrative
- Scalable

This is **not** a marketing website and **not** a flashy Web3 demo.

Target feeling:
> “A real supply‑chain management system that institutions can trust.”

---

## 3. Technology Constraints

The following constraints are mandatory:

- Frontend: **React.js**
- Language: **JavaScript + JSX**
- ❌ No TypeScript
- ❌ No experimental frameworks
- ❌ No frontend‑only data models
- ❌ No mock data

The frontend must integrate directly with backend APIs.

---

## 4. Global Design System

### 4.1 Color Scheme

Primary background:
- Pure white `#FFFFFF`
- Light gray `#F8FAFC`

Primary accent:
- Agriculture green `#14532D`

Secondary accent:
- Soft blue / teal (used sparingly)

Borders:
- Light gray `#E5E7EB`

Status colors:
- Success: muted green
- Warning: amber
- Error: muted red

Gradients:
- Allowed only if extremely subtle
- Example: white → very light gray
- No dark or saturated gradients

---

### 4.2 Typography

- Headings: Clean sans‑serif (medium weight)
- Body text: Regular sans‑serif
- IDs / batch codes: Monospace

Language style:
- Neutral
- Instructional
- Clear
- No marketing fluff inside dashboards

---

### 4.3 UI Components

**Cards**
- White background
- Rounded corners
- Soft border
- Clear title and value

**Tables**
- Heavy usage across system
- Column names must align with backend fields
- Status shown using badges

**Buttons**
- Primary: Green
- Secondary: White with border
- Disabled buttons clearly muted

---

## 5. Global Layout Structure

All authenticated pages follow a common layout.

### 5.1 Top Navigation Bar

- Left: App name / logo
- Center: Current role badge
- Right: User dropdown (Profile, Logout)

The role badge must reflect backend role.

---

### 5.2 Sidebar Navigation

- Vertical left sidebar
- Icon + label
- Only role‑allowed routes visible
- Active route highlighted

---

### 5.3 Main Content Area

- Page title
- Optional breadcrumbs
- Cards / tables
- Clear action placement

---

## 6. Stitch AI Usage Strategy

Stitch AI is used strictly for **structural design**, not creative freedom.

Important constraint:
- Stitch generates **3 frames at a time**

Therefore:
- Pages are grouped logically
- Tasks below specify which pages to generate together

Each Stitch design must be validated against backend fields before implementation.

---

## 7. Page‑Wise Design Specification

### TASK 1: Landing Page

Purpose:
- Entry point
- Product explanation

Content:
- System overview
- Supply chain flow
- CTA button

Navigation:
- CTA → Role Selection

---

### TASK 2: Role Selection Page

Purpose:
- Force explicit role selection

UI:
- Cards for:
  - Farmer
  - Distributor
  - Transporter
  - Retailer
  - Consumer

Each card:
- Icon
- Short description

Output:
- Selected role stored
- Redirect to registration

---

### TASK 3: Registration Pages

Purpose:
- Create User + StakeholderProfile + KYCRecord

Common fields:
- Name
- Email
- Password

Role‑specific fields (must match backend):

Farmer:
- Phone
- Organization / farm name

Distributor:
- Organization name

Transporter:
- Phone
- Organization

Retailer:
- Organization

Consumer:
- Minimal only

UI rules:
- Only role‑specific fields visible
- Clear labels
- Backend‑aligned validation

---

### TASK 4: Login Page

Fields:
- Email
- Password

Behavior:
- Authenticate
- Fetch role
- Fetch KYC status

Routing:
- PENDING → Waiting page
- REJECTED → Rejection page
- APPROVED → Dashboard

---

### TASK 5: KYC Status Pages

Pending Approval:
- Informational message
- No actions

Rejected:
- Rejection reason not provided
- Contact/help text

---

### TASK 6: Admin Dashboard

Sidebar:
- KYC Requests
- Users
- Batches
- Transport Requests
- Inspections
- Retail Listings

KYC Table:
- User
- Role
- Date
- Status
- Action buttons

Admin role:
- View and approve
- No supply‑chain actions

---

### TASK 7: Farmer Dashboard

Cards:
- Total batches
- Active batches
- Completed batches

Batch Table:
- batch_id
- crop_type
- quantity
- status
- created_at

Actions:
- Create batch
- Upload images / certificates

Images:
- File upload inputs
- Preview thumbnails

---

### TASK 8: Transporter Dashboard

Cards:
- Assigned requests
- In transit
- Delivered

Table:
- Transport requests

Actions:
- Accept
- Update status

Buttons enabled only if backend allows.

---

### TASK 9: Distributor Dashboard

Cards:
- Incoming batches
- Pending inspections
- Approved / rejected

Inspection flow:
- View batch
- Submit InspectionReport
- Approve / reject

Inspection immutable after submission.

---

### TASK 10: Retailer Dashboard

Cards:
- Inventory count
- Active listings
- Sold quantity

Listings table:
- batch_reference
- quantity
- price
- status

Actions:
- Create listing
- Update availability

---

### TASK 11: Consumer Dashboard

Purpose:
- Read‑only traceability

UI:
- Batch ID / QR input
- Timeline view:
  - Farmer
  - Transport
  - Inspection
  - Retail

---

### TASK 12: Image & Document Handling

Purpose:
- Upload certificates
- Upload batch images

Rules:
- Supported for certificates (organic_certificate, quality_test_report) and KYC documents
- Preview allowed
- Read-only after upload

---

### TASK 13: Blockchain UI Placeholder

Purpose:
- Visual preparation only

UI:
- Ledger‑style timeline
- Fake hashes
- Status indicators

No blockchain logic.

---

## 8. Execution Order

1. Create Stitch designs page‑by‑page
2. Validate against backend fields
3. Freeze design
4. Implement React frontend
5. Integrate backend immediately per page
6. Test role permissions and refresh behavior

---

## 9. Final Statement

This design document is **structural**, not decorative.

If followed correctly:
- Frontend and backend will remain aligned
- Integration issues will be minimal
- Blockchain integration later will be smooth

This is the **foundation document** for the frontend.

---
