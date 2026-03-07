# AgriChain – Agricultural Supply Chain Management System

## Project Overview

AgriChain is a full-stack web application that digitizes and tracks agricultural produce across the entire supply chain — from farm to consumer. The system enforces role-based access for six stakeholder types (Farmer, Transporter, Distributor, Retailer, Consumer, and Admin) and maintains an immutable event log for every state transition a crop batch undergoes.

The system features a **Financial State Machine** that handles payments between stakeholders via manual UPI execution and strict confirmation checkpoints. It also provides **Advanced Analytics** for supply chain performance.

The backend is built with Django REST Framework and exposes a JWT-secured REST API. The frontend is a React/Vite single-page application with Tailwind CSS. Each crop batch has a unique ID and a QR code; consumers can scan the QR or search by batch ID to see the complete supply chain journey, price breakdown, and origin details in real time.

---

## Implemented Features

- **User Registration & JWT Authentication** – Role-specific login with KYC approval gating.
- **KYC Workflow** – Admin approves/rejects stakeholder KYC requests; pending and rejected states shown to users.
- **10-State Batch Lifecycle** – Full state machine from `CREATED` → `SOLD` with ownership transfer at delivery points.
- **Financial State Machine** – UPI-based payment tracking between stakeholders.
- **Batch Locking** – Batches are automatically locked for further progression if payments are pending.
- **Farmer Portal** – Create crop batches, view batch list/status, request transport, and manage payments.
- **Transporter Portal** – Tabbed dashboard for Farmer→Distributor and Distributor→Retailer shipments; earnings tracking.
- **Distributor Portal** – Incoming / Inventory / Outgoing views; Store batch, request onward transport, and split batches.
- **Retailer Portal** – Received / Listed / Sold views; Create retail listing (triggers QR generation).
- **Consumer Portal** – QR/Batch ID search; full transparency report including price breakdown and origin.
- **Public Trace API** – Open endpoint for batch history and transparency.
- **Advanced Analytics** – Interactive charts for earnings, volumes, and status distributions using Recharts.
- **Admin Portal** – System-wide stats, user management, and KYC oversight.
- **Blockchain Integration** – Tamper-proof audit trail with automatic anchoring of critical events to Polygon Amoy testnet.

---

## System Architecture

### Backend (Django REST Framework)
- **Location**: `Backend/bsas_supplychain-main/`
- **Pattern**: Monolithic Django project with a single `supplychain` app.
- **Financial Logic**: Strict payment validation in `payment_views.py` and `batch_validators.py`.
- **View Organization**: Role-specific modules (e.g., `farmer_dashboard_views.py`, `distributor_views.py`).
- **Media Files**: QR codes and documents stored in `media/`.

### Frontend (React + Vite)
- **Location**: `Frontend/agri-supply-chain/`
- **State Management**: React Context (`AuthContext`) for auth and user state.
- **Localization**: `react-i18next` with local JSON translations.
- **Routing**: React Router v6 with granular role-based protection.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Frontend Styling | Tailwind CSS 3 |
| Frontend Analytics | Recharts |
| Frontend Icons | Lucide React |
| Frontend HTTP | Axios |
| Backend Framework | Django 5.x |
| Backend API | Django REST Framework 3.14+ |
| Authentication | djangorestframework-simplejwt |
| Database | SQLite (dev) / PostgreSQL (prod) |
| **Blockchain Layer** | **Web3.py + HashAnchor Smart Contract** |
| **Blockchain Network** | **Polygon Amoy Testnet** |
| **Hash Algorithm** | **SHA256 (deterministic)** |

---

## Installation & Setup

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 (LTS) or higher
- **Git**

---

### A. Backend First-Time Setup (Detailed)

This guide assumes you are setting up the project for the first time on a local machine.

#### 1. Navigate to Backend Directory
```powershell
cd Backend\bsas_supplychain-main
```

#### 2. Create Virtual Environment
Isolate the project's Python dependencies:
```powershell
python -m venv .venv
```

#### 3. Activate Virtual Environment
**Windows:**
```powershell
.venv\Scripts\activate
```
**Linux/macOS:**
```bash
source .venv/bin/activate
```

#### 4. Install Dependencies
Install all required Python packages (Django, DRF, JWT, PIL, etc.):
```powershell
pip install -r requirements.txt
```

#### 5. Apply Database Migrations
Create the local database schema:
```powershell
python manage.py migrate
```

#### 6. Seed Initial Data (CRITICAL)
The project requires initial roles and crop categories to function. Run this command to populate the database:
```powershell
python manage.py seed_data
```

#### 7. Create Admin Superuser
Create a user to access the Admin dashboard:
```powershell
python manage.py createsuperuser
```

#### 8. Start Development Server
```powershell
python manage.py runserver
```

---

### C. Blockchain Setup (Optional for Development)

The blockchain integration provides tamper-proof audit trails for critical events. Setup is optional for basic functionality but required for full transparency features.

#### 1. Install Blockchain Dependencies
```powershell
pip install web3>=6.0.0 eth-account>=0.8.0 eth-abi>=4.0.0 python-dotenv>=1.0.0
```

#### 2. Deploy HashAnchor Contract
```powershell
cd ../../blockchain
npm install
npx hardhat run scripts/deploy.js --network polygonAmoy
```

#### 3. Configure Environment Variables
Create `.env` file in `Backend/bsas_supplychain-main/`:
```bash
# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
HASH_ANCHOR_CONTRACT_ADDRESS=0x...  # Deployed contract address
ANCHORER_PRIVATE_KEY=0x...  # Private key with test MATIC
```

#### 4. Update Database Schema
```powershell
python manage.py makemigrations
python manage.py migrate
```

#### 5. Test Blockchain Integration
```powershell
python supplychain/hash_generator.py
python supplychain/blockchain_service.py
```

**Note**: Get test MATIC from [Polygon Amoy Faucet](https://faucet.polygon.technology/)

---

### B. Frontend Setup

#### 1. Navigate to Frontend Directory
```powershell
cd ..\..\Frontend\agri-supply-chain
```

#### 2. Install Packages
```powershell
npm install
```

#### 3. Start Development Server
```powershell
npm run dev
```

---

---

## Project History & Evolution (February 2026 Stabilization)

AgriChain underwent a major stabilization phase in early 2026 to transition from a mockup-heavy prototype to a production-ready Web2 system.

### Optimization Milestones
- **Stabilized 10-State Lifecycle**: Formalized the state machine with explicit `current_owner` tracking and status-gated transitions.
- **Role-Based Handover**: Implemented bilateral delivery verification where receivers must confirm arrival before ownership transfers.
- **Immutable Event Log**: Every critical state change (Creation, Transport, Listing, Sale) is logged in a `BatchEvent` table to mirror blockchain audit trails.
- **Transition to Real Data**: Removed all hardcoded mock data from the Consumer and Stakeholder portals, connecting them to live API endpoints.
- **Financial Enforcement**: Integrated a financial state machine that locks batch progression until specific payment milestones are met (UPI-based tracking).

---

## Blockchain Integration (Implemented)

The system now features a **Hybrid Web2/Web3** architecture with tamper-proof audit trails for critical supply chain events.

### 🎯 Current Implementation (70% Complete)

**✅ Implemented Features:**
- **HashAnchor Smart Contract** - Immutable storage of batch data hashes on Polygon Amoy
- **Deterministic Hashing** - SHA256-based canonical JSON representation of batch state
- **Automatic Event Anchoring** - Critical events automatically anchored to blockchain:
  - `CREATED` - When batch is first created by farmer
  - `DELIVERED_TO_DISTRIBUTOR` - At distributor handover
  - `DELIVERED_TO_RETAILER` - At retailer handover  
  - `SOLD` - Final sale to consumer
- **Data Integrity Verification** - Real-time verification of database vs blockchain data
- **Blockchain API Endpoints**:
  - `POST /api/batch/{id}/anchor/` - Manual anchoring
  - `GET /api/batch/{id}/verify/` - Integrity verification
  - `GET /api/batch/{id}/anchors/` - Anchor history
  - `GET /api/blockchain/status/` - System health check
  - `POST /api/events/{id}/retry-anchor/` - Retry failed anchors

**🔧 Technical Architecture:**
- **Smart Contract**: `HashAnchor.sol` with role-based access control
- **Network**: Polygon Amoy Testnet (Chain ID: 80002)
- **Backend Integration**: Web3.py with singleton service pattern
- **Hash Algorithm**: Deterministic SHA256 with sorted JSON keys
- **Error Handling**: Non-blocking blockchain failures (events still logged)

**⚠️ Setup Required:**
- Database schema updates (add blockchain fields)
- Environment configuration (RPC URL, contract address, private key)
- Contract deployment to Polygon Amoy testnet

### 🚀 Benefits for Supply Chain

- **Tamper-Proof Audit Trail**: Critical events cannot be altered after anchoring
- **Consumer Trust**: Verification badges showing data integrity
- **Regulatory Compliance**: Immutable records for audits
- **Dispute Resolution**: Blockchain evidence for supply chain disputes
- **Quality Assurance**: Verification of product journey authenticity

---

## Future Enhancements

### Advanced Blockchain Features
- **IPFS Integration** - Store inspection reports and certificates on decentralized storage
- **Multi-Chain Support** - Deploy to additional networks for redundancy
- **Gas Optimization** - Batch anchoring for multiple events
- **Smart Contract Upgrades** - Governance-based contract improvements

### Advanced Analytics
- **Blockchain Analytics Dashboard** - Real-time anchoring metrics
- **Gas Cost Tracking** - Monitor blockchain operation costs
- **Verification Success Rates** - Track data integrity across batches

---

## API Reference (Key Endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login/` | User authentication (JWT) |
| GET | `/api/dashboard/farmer/` | Farmer stats & batch summaries |
| POST | `/api/payments/` | View/declare/settle payments |
| POST | `/api/batch/<id>/bulk-split/` | Split batches (Distributor) |
| POST | `/api/distributor/transport/request-to-retailer/` | Onward transport request |
| GET | `/api/public/trace/<id>/` | Public batch traceability |
| **POST** | **`/api/batch/<id>/anchor/`** | **Manual blockchain anchoring** |
| **GET** | **`/api/batch/<id>/verify/`** | **Data integrity verification** |
| **GET** | **`/api/batch/<id>/anchors/`** | **Blockchain anchor history** |
| **GET** | **`/api/blockchain/status/`** | **Blockchain system health** |

---

## Folder Structure

```
f2f/
├── Backend/
│   └── bsas_supplychain-main/       # Django project
│       ├── supplychain/             # Core app
│       │   ├── payment_views.py     # Payment/Financial logic
│       │   ├── models.py            # DB Schema
│       │   ├── serializers.py       # API serializing
│       │   ├── hash_generator.py    # Blockchain hash generation
│       │   ├── blockchain_service.py # Web3 integration service
│       │   ├── blockchain_views.py  # Blockchain API endpoints
│       │   ├── event_logger.py      # Event logging with blockchain anchoring
│       │   └── management/          # Custom management commands (seed_data)
│       └── manage.py                # Django manager
│
├── Frontend/
│   └── agri-supply-chain/           # Vite project
│       ├── src/
│       │   ├── components/          # Reusable UI components
│       │   ├── context/             # Auth & Global state
│       │   ├── pages/               # UI Layers (Farmer, Retailer, etc.)
│       │   └── services/            # API integration (api.js)
│       └── package.json             # Frontend dependencies
│
└── blockchain/                       # Smart contract development
    ├── contracts/                    # Solidity contracts
    │   └── HashAnchor.sol           # Batch data anchoring contract
    ├── scripts/                     # Deployment scripts
    ├── hardhat.config.ts           # Development framework config
    └── typechain-types/             # Generated TypeScript types
```
