# Frontend Implementation Guide - Agri Supply Chain System

## Overview
This document provides complete instructions for implementing the React.js frontend for the Agri Supply Chain System. The frontend must integrate with the existing Django backend and follow the Stitch design references.

## Indian Context Requirements
All text, names, and currency must reflect Indian agriculture:
- **Currency**: Indian Rupees (₹) instead of dollars
- **Names**: Indian names (e.g., Rajesh Kumar, Priya Sharma, Amit Patel)
- **Locations**: Indian states and cities (e.g., Maharashtra, Punjab, Karnataka)
- **Crops**: Indian crops (e.g., Wheat, Rice, Cotton, Sugarcane, Turmeric)
- **Language**: Use Indian English variations where appropriate

## Technology Stack
- **Framework**: React.js 18+
- **Language**: JavaScript (ES6+) with JSX
- **Styling**: Tailwind CSS (matching Stitch design colors)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API or Zustand
- **Icons**: Material Icons / Lucide React
- **Build Tool**: Vite

## Backend Integration
- **Base URL**: `http://localhost:8000/api` (adjust for production)
- **Authentication**: Token-based (Django REST Framework)
- **All data must come from backend APIs** - no mock data allowed
- **Real-time updates** via polling or WebSocket (if backend supports)

## Color System (from Stitch Designs)
```css
--primary: #14522d;           /* Agriculture green */
--primary-hover: #0f3e22;     /* Darker green */
--background-light: #f6f8f7; /* Light gray */
--background-dark: #131f18;    /* Dark background */
--neutral-surface: #ffffff;    /* White cards */
--border-color: #e5e7eb;       /* Light borders */
```

## Route Structure

### Public Routes (No Authentication Required)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | AgriChain landing with hero section |
| `/role-selection` | RoleSelection | Choose role: Farmer/Distributor/Transporter/Retailer/Consumer |
| `/login` | LoginPage | Email + Password authentication |
| `/register/:role` | RegistrationPage | Role-specific registration |
| `/consumer/trace` | ConsumerTrace | Public traceability (no login needed) |

### Protected Routes (Authentication Required)
| Route | Component | Allowed Roles |
|-------|-----------|---------------|
| `/kyc-pending` | KYCPendingPage | All (KYC pending) |
| `/kyc-rejected` | KYCRejectedPage | All (KYC rejected) |
| `/admin/dashboard` | AdminDashboard | Admin only |
| `/farmer/dashboard` | FarmerDashboard | Farmer only |
| `/farmer/batch/new` | NewBatchPage | Farmer only |
| `/farmer/batch/:id` | BatchDetailPage | Farmer only |
| `/distributor/dashboard` | DistributorDashboard | Distributor only |
| `/distributor/inspection/:id` | InspectionPage | Distributor only |
| `/transporter/dashboard` | TransporterDashboard | Transporter only |
| `/transporter/transport/:id` | TransportDetailPage | Transporter only |
| `/retailer/dashboard` | RetailerDashboard | Retailer only |
| `/retailer/listing/new` | NewListingPage | Retailer only |
| `/consumer/dashboard` | ConsumerDashboard | Consumer only |
| `/profile` | ProfilePage | All approved users |

## Pages to Implement (Based on Stitch Designs)

### 1. Landing Page (`/`) ✅ KEEP
- **Reference**: `agrichain_landing_page/`
- **Features**: Hero section, stats (10k+ farmers), CTA buttons
- **Indian Context**: Show Indian farmer success stories, Indian crop statistics
- **Navigation**: "Get Started" → `/role-selection`, "Log In" → `/login`

### 2. Role Selection Page (`/role-selection`) ✅ KEEP
- **Reference**: `role_selection_choice/`
- **Features**: 5 role cards with icons
- **Roles**: Farmer (किसान), Distributor (वितरक), Transporter (परिवहनकर्ता), Retailer (विक्रेता), Consumer (उपभोक्ता)
- **Navigation**: Click role → `/register/:role`

### 3. Login Page (`/login`) ✅ KEEP
- **Reference**: `system_login_access/`
- **Features**: Email, password, forgot password link
- **Backend Integration**: POST to `/api/auth/login/`
- **After Login**: Check KYC status → route accordingly

### 4. Registration Pages (`/register/:role`) ✅ KEEP
- **References**: `transporter_registration_page/`, `consumer_quick_registration/`
- **Common Fields**: Username, Email, Password, Confirm Password
- **Role-Specific**:
  - **Farmer**: Phone, Organization (Farm Name), Location (State/District)
  - **Distributor**: Phone, Organization (Company Name), GST Number
  - **Transporter**: Phone, Organization (Transport Company), Vehicle Number
  - **Retailer**: Phone, Organization (Shop Name), Shop Address
  - **Consumer**: Phone only
- **Backend Integration**: POST to `/api/auth/register/`

### 5. KYC Status Pages ✅ KEEP
- **Reference**: `kyc_status_tracking/`
- **Pending**: Informational message, no actions
- **Rejected**: "KYC verification failed. Contact support." (no reason provided by backend)

### 6. Admin Dashboard (`/admin/dashboard`) ✅ KEEP
- **Reference**: `admin_control_center_dashboard/`
- **Features**:
  - Sidebar: KYC Requests, Users, Batches, Transport, Inspections, Listings
  - KYC Table: User, Role, Date, Status, Approve/Reject buttons
  - Stats cards: Pending KYC, Total Users, Active Batches
- **Backend APIs**: `/api/kyc-records/`, `/api/stakeholder-profiles/`

### 7. Farmer Dashboard (`/farmer/dashboard`) ✅ KEEP
- **Features**:
  - Cards: Total Batches, Active Batches, Completed Batches
  - Batch Table: product_batch_id, crop_type, quantity, created_at
  - Actions: "New Batch" button
- **Backend APIs**: `/api/crop-batches/`

### 8. New Crop Batch Page (`/farmer/batch/new`) ✅ KEEP
- **Reference**: `new_crop_batch_registration/`
- **Fields**:
  - Crop Type (dropdown: Wheat, Rice, Cotton, Sugarcane, Turmeric, etc.)
  - Quantity (in Quintals/Kg)
  - Harvest Date
  - Organic Certificate (file upload)
  - Quality Test Report (file upload)
- **Backend APIs**: POST to `/api/crop-batches/`

### 9. Batch Detail Page (`/farmer/batch/:id`) ✅ KEEP
- **Reference**: `batch_detailed_information/`
- **Features**:
  - Batch info display
  - QR Code display (from qr_code_data field)
  - Timeline of batch journey
  - Certificate download

### 10. Distributor Dashboard (`/distributor/dashboard`) ✅ KEEP
- **Reference**: `distributor_inspection_dashboard/`
- **Features**:
  - Cards: Incoming Batches, Pending Inspections, Approved
  - Table: Batch ID, Farmer Name, Crop Type, Status
  - Actions: "Inspect" button
- **Backend APIs**: `/api/crop-batches/`, `/api/inspection-reports/`

### 11. Inspection Page (`/distributor/inspection/:id`) ✅ KEEP
- **Reference**: `inspection_report_details/`
- **Fields**:
  - Batch Details (read-only)
  - Storage Conditions (textarea)
  - Quality Grade (dropdown: A, B, C)
  - Inspection Report File (upload)
  - Pass/Fail toggle
- **Backend APIs**: POST to `/api/inspection-reports/`

### 12. Transporter Dashboard (`/transporter/dashboard`) ✅ KEEP
- **Reference**: `transporter_logistics_dashboard/`
- **Features**:
  - Cards: Assigned Requests, In Transit, Delivered
  - Table: Transport ID, From, To, Status, Actions
  - Actions: Accept, Update Status
- **Statuses**: OPEN → ACCEPTED → IN_TRANSIT → DELIVERED
- **Backend APIs**: `/api/transport-requests/`

### 13. Transport Detail Page (`/transporter/transport/:id`) ✅ KEEP
- **Reference**: `transport_request_details/`
- **Fields**:
  - Batch Details
  - Pickup Location
  - Delivery Location
  - Vehicle Details
  - Driver Details
  - Status Updates
  - Delivery Proof (photo upload)
- **Backend APIs**: PATCH to `/api/transport-requests/:id/`

### 14. Retailer Dashboard (`/retailer/dashboard`) ✅ KEEP
- **Reference**: `retailer_inventory_&_sales_dashboard/`
- **Features**:
  - Cards: Inventory Count, Active Listings, Total Sales (₹)
  - Table: Batch Reference, Quantity, Price (₹), Status
  - Actions: Create Listing, Mark as Sold
- **Backend APIs**: `/api/retail-listings/`, `/api/price-breakdown/`

### 15. Consumer Dashboard (`/consumer/dashboard`) ✅ KEEP
- **Reference**: `consumer_traceability_portal/`
- **Features**:
  - QR Code / Batch ID input
  - Timeline view: Farmer → Transport → Inspection → Retail
  - Full traceability details
  - Indian context: Show origin farm, district, state
- **Backend APIs**: `/api/consumer-scans/`, `/api/crop-batches/:id/`

## Pages to REMOVE ❌

The following Stitch design folders should NOT be implemented as separate pages:
- `transporter_registration_&_kyc_1/` - Combine into single registration flow
- `transporter_registration_&_kyc_2/` - Combine into single registration flow
- `transporter_registration_&_kyc_3/` - Combine into single registration flow
- `transporter_registration_&_kyc_4/` - Combine into single registration flow

## Component Architecture

### Layout Components
```
components/
├── Layout/
│   ├── MainLayout.jsx          # Authenticated layout with sidebar
│   ├── PublicLayout.jsx        # Public pages layout
│   ├── Sidebar.jsx             # Role-based navigation
│   ├── TopNav.jsx              # Header with role badge
│   └── Footer.jsx              # Footer component
```

### Page Components
```
pages/
├── public/
│   ├── LandingPage.jsx
│   ├── RoleSelection.jsx
│   ├── LoginPage.jsx
│   └── ConsumerTrace.jsx
├── auth/
│   ├── RegistrationPage.jsx
│   ├── KYCPendingPage.jsx
│   └── KYCRejectedPage.jsx
├── admin/
│   └── AdminDashboard.jsx
├── farmer/
│   ├── FarmerDashboard.jsx
│   ├── NewBatchPage.jsx
│   └── BatchDetailPage.jsx
├── distributor/
│   ├── DistributorDashboard.jsx
│   └── InspectionPage.jsx
├── transporter/
│   ├── TransporterDashboard.jsx
│   └── TransportDetailPage.jsx
├── retailer/
│   ├── RetailerDashboard.jsx
│   └── NewListingPage.jsx
└── consumer/
    └── ConsumerDashboard.jsx
```

### Shared Components
```
components/
├── common/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Card.jsx
│   ├── Table.jsx
│   ├── StatusBadge.jsx
│   ├── FileUpload.jsx
│   └── QRCodeDisplay.jsx
├── forms/
│   ├── LoginForm.jsx
│   ├── RegistrationForm.jsx
│   ├── BatchForm.jsx
│   ├── InspectionForm.jsx
│   └── TransportForm.jsx
└── charts/
    └── StatsChart.jsx
```

## API Integration Pattern

### Authentication Flow
```javascript
// Auth Context
const login = async (email, password) => {
  const response = await api.post('/auth/login/', { email, password });
  const { token, user, role, kyc_status } = response.data;
  
  localStorage.setItem('token', token);
  setUser(user);
  setRole(role);
  setKycStatus(kyc_status);
  
  // Route based on KYC status
  if (kyc_status === 'PENDING') navigate('/kyc-pending');
  else if (kyc_status === 'REJECTED') navigate('/kyc-rejected');
  else navigate(`/${role.toLowerCase()}/dashboard`);
};
```

### Protected Route Guard
```javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, kycStatus } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (kycStatus !== 'APPROVED') return <Navigate to="/kyc-pending" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;
  
  return children;
};
```

## Indian Context Text Examples

### Landing Page
- "10,000+ भारतीय किसान जुड़े हुए" (10,000+ Indian Farmers Connected)
- "50 लाख+ उत्पाद ट्रैक किए गए" (50 Lakh+ Products Tracked)
- "भारत का भरोसेमंद कृषि आपूर्ति श्रृंखला" (India's Trusted Agricultural Supply Chain)

### Dashboard Cards
- Farmer: "कुल फसल बैच" (Total Crop Batches)
- Distributor: "आने वाली फसल" (Incoming Crops)
- Transporter: "सक्रिय परिवहन" (Active Transport)
- Retailer: "कुल बिक्री (₹)" (Total Sales in ₹)

### Buttons & Actions
- "नया बैच बनाएं" (Create New Batch)
- "निरीक्षण करें" (Inspect)
- "परिवहन स्वीकारें" (Accept Transport)
- "₹ में कीमत दर्ज करें" (Enter Price in ₹)

## File Structure
```
Frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── charts/
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── farmer/
│   │   ├── distributor/
│   │   ├── transporter/
│   │   ├── retailer/
│   │   └── consumer/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useRole.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Implementation Checklist

### Phase 1: Setup & Authentication
- [ ] Initialize Vite React project
- [ ] Install dependencies (React Router, Axios, Tailwind)
- [ ] Setup Tailwind config with custom colors
- [ ] Create Auth Context
- [ ] Implement Login page
- [ ] Implement Registration pages (all roles)
- [ ] Implement KYC status pages
- [ ] Setup protected routes

### Phase 2: Public Pages
- [ ] Landing page with Indian context
- [ ] Role selection page
- [ ] Consumer trace page (public)

### Phase 3: Role Dashboards
- [ ] Admin Dashboard with KYC management
- [ ] Farmer Dashboard with batch management
- [ ] Distributor Dashboard with inspection
- [ ] Transporter Dashboard with transport tracking
- [ ] Retailer Dashboard with inventory
- [ ] Consumer Dashboard with traceability

### Phase 4: Detail Pages & Forms
- [ ] New Batch form (Farmer)
- [ ] Batch Detail view
- [ ] Inspection form (Distributor)
- [ ] Transport detail & update (Transporter)
- [ ] New Listing form (Retailer)

### Phase 5: Polish & Integration
- [ ] Connect all forms to backend APIs
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Test all user flows
- [ ] Verify Indian context throughout

## Backend API Endpoints Reference

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Current user info

### Stakeholders
- `GET /api/stakeholder-profiles/` - List profiles
- `GET /api/stakeholder-profiles/:id/` - Get profile
- `PATCH /api/stakeholder-profiles/:id/` - Update profile

### KYC
- `GET /api/kyc-records/` - List KYC records (admin)
- `POST /api/kyc-records/` - Submit KYC
- `PATCH /api/kyc-records/:id/` - Update KYC status (admin)

### Crop Batches
- `GET /api/crop-batches/` - List batches
- `POST /api/crop-batches/` - Create batch
- `GET /api/crop-batches/:id/` - Get batch details
- `PATCH /api/crop-batches/:id/` - Update batch

### Transport
- `GET /api/transport-requests/` - List requests
- `POST /api/transport-requests/` - Create request
- `PATCH /api/transport-requests/:id/` - Update status

### Inspections
- `GET /api/inspection-reports/` - List reports
- `POST /api/inspection-reports/` - Create report

### Retail
- `GET /api/retail-listings/` - List listings
- `POST /api/retail-listings/` - Create listing
- `GET /api/price-breakdown/` - Get price details

### Consumer
- `POST /api/consumer-scans/` - Record scan
- `GET /api/crop-batches/:id/timeline/` - Get traceability

## Notes

1. **No Mock Data**: Every piece of data must come from the backend
2. **Real-time Updates**: Use polling for status updates (every 30 seconds)
3. **Error Handling**: Show user-friendly error messages in Hindi/English
4. **Loading States**: Show skeleton loaders for data fetching
5. **File Uploads**: Support image uploads for certificates and delivery proof
6. **Responsive**: Mobile-first design, works on all screen sizes
7. **Accessibility**: Follow WCAG 2.1 guidelines

## Important Rules

1. ✅ All functionality must work with real backend APIs
2. ✅ Indian context throughout (₹, Indian names, locations)
3. ✅ Follow Stitch design color scheme exactly
4. ✅ No placeholder data - everything dynamic from backend
5. ✅ Proper role-based access control
6. ✅ KYC flow enforced before dashboard access
7. ❌ No TypeScript
8. ❌ No mock data or hardcoded values
9. ❌ No pages that don't connect to backend functionality

---

**Start Implementation**: Begin with Phase 1 (Setup & Authentication)
