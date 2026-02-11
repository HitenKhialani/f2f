# Frontend Design Prompt for Agri Supply Chain System

## Overview
Create a complete set of UI designs for the Agri Supply Chain System frontend using React.js. The designs must strictly adhere to the provided specifications, ensuring full alignment with the backend APIs and data models. Use the global design system, layout structure, and page-wise details below. Generate designs in groups of 3 frames as per Stitch AI constraints.

## Backend Alignment
The backend is implemented in Django with the following key models and APIs (from backendimplemented.md):
- **Models**: StakeholderProfile, KYCRecord, CropBatch, TransportRequest, InspectionReport, BatchSplit, RetailListing, ConsumerScan
- **Roles**: Farmer, Distributor, Transporter, Retailer, Consumer, Admin
- **APIs**: RESTful endpoints under /api/ for CRUD operations, authentication, and role-based permissions
- Ensure all fields, workflows, and permissions are reflected in the UI.

## Technology & Constraints
- **Framework**: React.js with JavaScript and JSX
- **No TypeScript, no experimental frameworks, no mock data**
- **Integration**: Direct backend API calls, no frontend-only logic

## Global Design System
- **Colors**: Pure white (#FFFFFF) and light gray (#F8FAFC) backgrounds; agriculture green (#14532D) accent; soft blue/teal secondary; light gray (#E5E7EB) borders; muted status colors (green success, amber warning, red error); subtle gradients only.
- **Typography**: Clean sans-serif headings (medium weight), regular body text, monospace for IDs/batch codes. Neutral, instructional language.
- **Components**:
  - Cards: White bg, rounded corners, soft borders, clear titles/values.
  - Tables: Heavy use, columns matching backend fields, status badges.
  - Buttons: Primary green, secondary white with border, muted disabled.
- **Layout**:
  - Top nav: App logo left, role badge center, user dropdown right.
  - Sidebar: Vertical left, icons+labels, role-allowed routes only, active highlight.
  - Main area: Page title, optional breadcrumbs, cards/tables, clear actions.

## Routing Structure
Infer routes based on page purposes:
- / (Landing)
- /role-selection
- /register/:role (Farmer, Distributor, Transporter, Retailer, Consumer)
- /login
- /kyc-pending
- /kyc-rejected
- /dashboard (role-specific: farmer, distributor, transporter, retailer, consumer, admin)
- /batch/:id (view/edit)
- /transport/:id
- /inspection/:id
- /listing/:id
- /consumer/scan

## Page-Wise Designs (Grouped for 3-Frame Generation)

### Group 1: Entry and Auth Pages
1. **Landing Page** (TASK 1)
   - Purpose: Entry point with system overview and supply chain flow diagram.
   - Content: Hero section with CTA button to role selection.
   - Navigation: CTA redirects to /role-selection.

2. **Role Selection Page** (TASK 2)
   - Purpose: Force role choice.
   - UI: 5 cards (Farmer, Distributor, Transporter, Retailer, Consumer) with icons and short descriptions.
   - Output: Store selected role, redirect to /register/:role.

3. **Login Page** (TASK 4)
   - Fields: Email, Password.
   - Behavior: Authenticate, fetch role/KYC status, route to /kyc-pending (PENDING), /kyc-rejected (REJECTED), or /dashboard (APPROVED).

### Group 2: Registration and KYC
4. **Registration Pages** (TASK 3)
   - Purpose: Create User, StakeholderProfile, KYCRecord.
   - Common fields: Username (Name), Email, Password.
   - Role-specific (match backend StakeholderProfile):
     - Farmer: Phone, Organization (farm name)
     - Distributor: Phone, Organization (company name)
     - Transporter: Phone, Organization (company name)
     - Retailer: Phone, Organization (shop name)
     - Consumer: Phone only (minimal)
   - UI: Role-specific fields visible, backend-aligned validation, file upload for KYC documents (document_file).

5. **KYC Status Pages** (TASK 5)
   - Pending: Informational message, no actions.
   - Rejected: Message "KYC rejected", no reason provided, contact/help text.

### Group 3: Dashboards - Admin and Farmer
6. **Admin Dashboard** (TASK 6)
   - Sidebar: KYC Requests, Users, Batches, Transport Requests, Inspections, Retail Listings.
   - KYC Table: Columns - User, Role, Date, Status, Actions (Approve/Reject buttons).
   - Role: View/approve KYC, no supply-chain actions.

7. **Farmer Dashboard** (TASK 7)
   - Cards: Total batches, Active batches, Completed batches.
   - Batch Table: Columns - product_batch_id (batch_id), crop_type, quantity, status, created_at.
   - Actions: Create batch button, upload certificates (organic_certificate, quality_test_report).
   - Upload: File inputs with previews, read-only after upload.

### Group 4: Dashboards - Transporter and Distributor
8. **Transporter Dashboard** (TASK 8)
   - Cards: Assigned requests, In transit, Delivered.
   - Table: Transport requests with status, details.
   - Actions: Accept (if OPEN), Update status (to IN_TRANSIT/DELIVERED) buttons, enabled per backend permissions.

9. **Distributor Dashboard** (TASK 9)
   - Cards: Incoming batches, Pending inspections, Approved/Rejected.
   - Inspection flow: View batch, submit InspectionReport (report_file, storage_conditions, passed boolean).
   - Immutable after submission.

### Group 5: Dashboards - Retailer and Consumer
10. **Retailer Dashboard** (TASK 10)
    - Cards: Inventory count, Active listings, Sold quantity.
    - Listings Table: batch_reference, quantity, price (from PriceBreakdown), status.
    - Actions: Create listing, update availability.

11. **Consumer Dashboard** (TASK 11)
    - Purpose: Read-only traceability.
    - UI: Input for batch ID/QR, timeline view with stages: Farmer (creation), Transport, Inspection, Retail.

### Group 6: Special Components
12. **Image & Document Handling** (TASK 12)
    - Integrated into relevant pages (registration, farmer batch create).
    - Rules: File uploads for certificates and KYC, previews, read-only post-upload.

13. **Blockchain UI Placeholder** (TASK 13)
    - Ledger-style timeline with fake hashes and status indicators.
    - No logic, visual only.

## Execution Guidelines
- Generate designs in the specified groups (3 frames each).
- Validate each design against backend fields and workflows.
- Ensure professional, minimal, trustworthy feel.
- Align with supply chain flow from backendimplemented.md.
- Include all parameters, details, and routing as specified.

## Final Output
Provide Figma/Stitch designs with annotations for React implementation, ensuring seamless backend integration.
