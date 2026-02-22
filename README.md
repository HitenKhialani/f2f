# AgriChain – Agricultural Supply Chain Management System

## Project Overview

AgriChain is a full-stack web application that digitizes and tracks agricultural produce across the entire supply chain — from farm to consumer. The system enforces role-based access for six stakeholder types (Farmer, Transporter, Distributor, Retailer, Consumer, and Admin) and maintains an immutable event log for every state transition a crop batch undergoes.

The backend is built with Django REST Framework and exposes a JWT-secured REST API. The frontend is a React/Vite single-page application with Tailwind CSS. Each crop batch has a unique ID and a QR code; consumers can scan the QR or search by batch ID to see the complete supply chain journey, price breakdown, and origin details in real time.

The system is currently Web2-stable and architected to support future Ethereum/Solidity smart contract integration, with every batch lifecycle event mapped directly to an equivalent smart contract function.

---

## Implemented Features

- **User Registration & JWT Authentication** – Role-specific login with KYC approval gating
- **KYC Workflow** – Admin approves/rejects stakeholder KYC requests; pending and rejected states shown to users
- **10-State Batch Lifecycle** – Full state machine from `CREATED` → `SOLD` with ownership transfer at delivery points
- **Farmer Portal** – Create crop batches, view batch list and status, request transport to a distributor
- **Transporter Portal** – Tabbed dashboard separating Farmer→Distributor and Distributor→Retailer shipments; Accept/Reject/Mark-Delivered actions
- **Distributor Portal** – Incoming / Inventory / Outgoing tabbed view; Store batch, request onward transport; optional inspection
- **Retailer Portal** – Received / Listed / Sold tabbed view; Create retail listing (triggers QR generation), Mark as Sold
- **Consumer Portal** – Search by batch ID or scan QR code; full traceability report with origin details, price breakdown, and chronological journey timeline
- **QR Code Generation** – Auto-generated on retail listing; downloadable; links to public trace endpoint
- **Public Trace API** – Unauthenticated `GET /api/public/trace/<id>/` returning structured JSON with timeline, price breakdown, and origin
- **Admin Portal** – System stats, user list, KYC management, role assignment
- **Immutable Event Log** – `BatchEvent` records every state transition with actor, timestamp, and metadata
- **Ownership Tracking** – `current_owner` on `CropBatch` updated automatically at `DELIVERED_TO_DISTRIBUTOR` and `DELIVERED_TO_RETAILER`
- **Bulk Split Batches** – Distributors can split batches into multiple child batches for different retailers
- **Child Batch Tracking** – `is_child_batch` and `parent_batch` fields track split lineage
- **Quantity-based Inventory** – Retail listings track total, remaining, and sold quantities with revenue calculation

---

## System Architecture

### Backend (Django REST Framework)
- **Location**: `Backend/bsas_supplychain-main/`
- **Pattern**: Monolithic Django project with a single `supplychain` app
- **View Organization**: Role-specific view modules (`farmer_dashboard_views.py`, `distributor_views.py`, `retailer_views.py`, `transport_views.py`, `suspend_views.py`, `bulk_split_views.py`)
- **Authentication**: JWT via `djangorestframework-simplejwt`; tokens stored in frontend `localStorage`
- **CORS**: `django-cors-headers` configured to allow the Vite dev server
- **Database**: SQLite (development); PostgreSQL-ready for production
- **Admin Panel**: `http://localhost:8000/admin/` for manual KYC approval and debugging
- **Media Files**: QR code images saved to `media/qr_codes/`

### Frontend (React + Vite)
- **Location**: `Frontend/agri-supply-chain/`
- **State Management**: React Context (`AuthContext`) – stores JWT tokens and user role
- **HTTP Client**: Axios with Bearer token header; auto-redirects to `/login` on 401
- **Routing**: React Router v6; role-based route protection
- **API Base URL**: Configured in `src/services/api.js` (defaults to `http://localhost:8000/api`)

### Blockchain (Planned)
- Not yet integrated; Ethereum/Solidity contracts planned
- Current `BatchEvent` log maps 1:1 to smart contract functions
- `wallet_id` field present on `StakeholderProfile` for future Web3 use

---

## Supply Chain Workflow

```
CREATED               ← Farmer creates batch
    ↓
TRANSPORT_REQUESTED   ← Farmer requests transport to Distributor
    ↓
IN_TRANSIT_TO_DISTRIBUTOR  ← Transporter accepts
    ↓
DELIVERED_TO_DISTRIBUTOR   ← Transporter delivers  ⚡ Ownership: Farmer → Distributor
    ↓
STORED                ← Distributor stores batch
    ↓
TRANSPORT_REQUESTED_TO_RETAILER  ← Distributor requests transport to Retailer
    ↓
IN_TRANSIT_TO_RETAILER  ← Transporter accepts
    ↓
DELIVERED_TO_RETAILER   ← Transporter delivers  ⚡ Ownership: Distributor → Retailer
    ↓
LISTED                ← Retailer creates sale listing (QR generated)
    ↓
SOLD                  ← Retailer marks as sold

(Any status above)  → SUSPENDED   ⚡ Action: Owners can freeze batch at allowed windows
```

**Ownership rules:**
- Transporter is never an owner
- Ownership transfers only at delivery confirmation
- Inspection is optional and does not block status progression

**Suspension Rules:**
- **Farmer** can suspend at: `CREATED`, `TRANSPORT_REQUESTED`, `TRANSPORT_REJECTED`
- **Distributor** can suspend at: `DELIVERED_TO_DISTRIBUTOR`, `STORED`
- **Retailer** can suspend at: `LISTED`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Frontend Styling | Tailwind CSS 3 |
| Frontend HTTP | Axios |
| Frontend Routing | React Router DOM v6 |
| QR Code | qrcode.react |
| Backend Framework | Django 5.x |
| Backend API | Django REST Framework 3.14+ |
| Authentication | djangorestframework-simplejwt |
| CORS | django-cors-headers |
| Database | SQLite (dev) |
| Blockchain | Ethereum / Solidity (planned) |

---

## Installation & Setup

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- **Git**

---

### A. First-Time Setup (After Cloning)

#### 1. Clone the Repository

```bash
git clone <repo-url>
cd f2f
```

#### 2. Backend Setup

```powershell
cd Backend\bsas_supplychain-main

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Apply seed data
python manage.py seed_data

# (Optional) Create a superuser for Django admin
python manage.py createsuperuser
```

#### 3. Frontend Setup

```powershell
cd ..\..\Frontend\agri-supply-chain

# Install dependencies
npm install
```

#### 4. Environment Variables (Optional)

The frontend defaults to `http://localhost:8000/api`. To override, create a `.env` file in `Frontend/agri-supply-chain/`:

```env
VITE_API_URL=http://localhost:8000/api
```

For production, update `Backend/bsas_supplychain-main/settings.py`:
- Change `SECRET_KEY` to a secure value
- Set `DEBUG = False`
- Add your domain to `ALLOWED_HOSTS`
- Switch `DATABASES` to PostgreSQL

---

### B. Normal Development Run

Open **two terminals**:

**Terminal 1 – Backend:**

```powershell
cd Backend\bsas_supplychain-main
.venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

Backend available at: `http://localhost:8000`  
Django Admin at: `http://localhost:8000/admin/`

**Terminal 2 – Frontend:**

```powershell
cd Frontend\agri-supply-chain
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## API Reference (Key Endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/logout/` | Logout, blacklists refresh token |
| GET | `/api/users/me/` | Get current user profile |
| GET/POST | `/api/crop-batches/` | List / create crop batches |
| POST | `/api/transport/request/` | Request transport |
| POST | `/api/transport/<id>/accept/` | Transporter accepts request |
| POST | `/api/transport/<id>/deliver/` | Transporter marks delivered |
| POST | `/api/transport/<id>/arrive/` | Mark arrival at destination (transporter) |
| POST | `/api/transport/<id>/confirm-arrival/` | Confirm arrival by receiving party |
| POST | `/api/transport/<id>/reject/` | Transporter rejects request |
| POST | `/api/batch/<id>/suspend/` | Suspend batch (role & status gated) |
| POST | `/api/batch/<id>/bulk-split/` | Split batch into multiple child batches |
| GET | `/api/dashboard/farmer/` | Farmer dashboard statistics |
| GET | `/api/dashboard/transporter/` | Transporter dashboard data |
| GET | `/api/dashboard/distributor/` | Distributor dashboard data |
| GET | `/api/dashboard/retailer/` | Retailer dashboard data |
| POST | `/api/distributor/transport/request-to-retailer/` | Distributor requests onward transport |
| POST | `/api/retailer/batch/<id>/mark-sold/` | Retailer marks batch sold |
| GET/POST | `/api/retail-listings/` | Create retail listing (triggers QR) |
| GET/POST | `/api/inspections/` | Create / list inspection reports |
| GET | `/api/public/trace/<public_id>/` | Public batch trace (unauthenticated) |
| GET | `/api/users/?role=<ROLE>&kyc_status=APPROVED` | List approved users by role |

---

## Frontend Routes

| Role | Route | Description |
|---|---|---|
| — | `/login` | Login page |
| — | `/role-selection` | Role picker for registration |
| — | `/kyc-pending` | KYC awaiting approval |
| — | `/kyc-rejected` | KYC rejected page |
| Farmer | `/farmer/dashboard` | Batch list + transport request |
| Transporter | `/transporter/dashboard` | Shipment tabs + actions |
| Distributor | `/distributor/dashboard` | Incoming / Inventory / Outgoing |
| Distributor | `/distributor/incoming` | Incoming transport batches |
| Distributor | `/distributor/inventory` | Stored batches management |
| Distributor | `/distributor/outgoing` | Outgoing transport requests |
| Distributor | `/distributor/inspection/:id` | Inspection form for batch |
| Retailer | `/retailer/received` | Received batches from distributor |
| Retailer | `/retailer/incoming-transport` | Incoming transport tracking |
| Retailer | `/retailer/listed` | Listed products for sale |
| Retailer | `/retailer/sold` | Sold products history |
| Retailer | `/retailer/dashboard` | Received / Listed / Sold |
| Retailer | `/retailer/listing/new` | Create new retail listing |
| Consumer | `/consumer` | QR / batch ID search |
| Consumer | `/trace/:id` | Public traceability report |
| Admin | `/admin/dashboard` | System overview |
| Admin | `/admin/kyc` | KYC management |
| Admin | `/admin/users` | User management |
| All | `/profile` | Universal profile page |

---

## Folder Structure

```
f2f/
├── Backend/
│   └── bsas_supplychain-main/       # Django project root
│       ├── bsas_supplychain/        # Project settings & URLs
│       ├── supplychain/             # Core app (models, views, serializers)
│       │   ├── models.py            # CropBatch, BatchEvent, TransportRequest, etc.
│       │   ├── views.py             # ViewSets and API logic
│       │   ├── auth_views.py        # Authentication views
│       │   ├── admin_views.py       # Admin dashboard and KYC management
│       │   ├── transport_views.py   # Transport workflow views
│       │   ├── distributor_views.py # Distributor workflow views
│       │   ├── distributor_dashboard_views.py # Distributor dashboard API
│       │   ├── retailer_views.py    # Retailer-specific views
│       │   ├── retailer_dashboard_views.py # Retailer dashboard API
│       │   ├── farmer_dashboard_views.py   # Farmer dashboard API
│       │   ├── transporter_dashboard_views.py # Transporter dashboard API
│       │   ├── bulk_split_views.py  # Batch splitting logic
│       │   ├── suspend_views.py     # Batch suspension logic
│       │   ├── consumer_views.py    # Public trace endpoint
│       │   ├── serializers.py       # DRF serializers
│       │   ├── permissions.py       # Role-based permission classes
│       │   ├── batch_validators.py  # Status transition validation
│       │   ├── event_logger.py      # BatchEvent creation helpers
│       │   └── utils.py             # QR code generation utility
│       ├── manage.py
│       ├── requirements.txt
│       ├── settings.py
│       └── db.sqlite3               # SQLite database (dev only)
│
└── Frontend/
    └── agri-supply-chain/           # Vite + React project root
        ├── src/
        │   ├── App.jsx              # Route definitions
        │   ├── context/             # AuthContext (JWT + user state)
        │   ├── services/            # Axios API client (api.js)
        │   ├── pages/               # One folder per role + shared pages
        │   └── components/          # Shared UI components
        ├── package.json
        ├── vite.config.js
        └── tailwind.config.js
```

---

## Common Issues

| Issue | Cause | Fix |
|---|---|---|
| CORS error | Missing CORS header | Ensure `corsheaders` is in `INSTALLED_APPS` and `MIDDLEWARE` in `settings.py`; add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` |
| 401 Unauthorized | JWT token expired | Frontend auto-redirects to `/login`; re-authenticate |
| `database is locked` | Multiple Django processes | Stop all Django instances and restart |
| Port already in use | Another process on 8000/5173 | Kill the process or run backend on `--port 8001` / frontend on `--port 3000` |
