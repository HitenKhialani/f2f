# AgriChain – Agricultural Supply Chain Management System

## 🚀 Quick Start (for Developers)

If you just cloned this repo, follow these steps to get it running in 5 minutes:

### 1. Backend Setup
```powershell
cd Backend\bsas_supplychain-main
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
pip install web3 eth-account eth-abi python-dotenv
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8001
```

### 2. Frontend Setup
```powershell
cd ../../Frontend/agri-supply-chain
npm install
npm run dev
```

### 3. Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001/api/
- **Admin**: http://localhost:8001/admin/ (Create a superuser first)

---

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
- **Enhanced Farmer Experience** – Harvest date constraints (15-day window), crop filtering based on preferences, comprehensive assistant bot with complete farmer actions.
- **Transporter Portal** – Tabbed dashboard for Farmer→Distributor and Distributor→Retailer shipments; earnings tracking.
- **Distributor Portal** – Incoming / Inventory / Outgoing views; Store batch, request onward transport, and split batches.
- **Retailer Portal** – Received / Listed / Sold views; Create retail listing (triggers QR generation).
- **Consumer Portal** – QR/Batch ID search with direct camera access; full transparency report including price breakdown and origin.
- **Enhanced Consumer Experience** – Direct camera QR scanning, filtered stakeholder view (no N/A entries), improved multilingual support.
- **Public Trace API** – Open endpoint for batch history and transparency.
- **Advanced Analytics** – Interactive charts for earnings, volumes, and status distributions using Recharts.
- **Admin Portal** – System-wide stats, user management, and KYC oversight.
- **Blockchain Integration** – Tamper-proof audit trail with automatic anchoring of critical events to Polygon Amoy testnet.
- **AI-Powered Assistant** – Multilingual conversational bot for farmers with complete action support and improved UI.
- **Multilingual Support** – Comprehensive translation support for English, Hindi, Marathi, Punjabi, and Gujarati.

---

## Recent UI & UX Improvements

### Enhanced Farmer Experience
- **Harvest Date Validation**: Restricted harvest date selection to last 15 days only for data accuracy
- **Smart Crop Filtering**: Crop dropdown now filters based on user's selected preferences during registration
- **Comprehensive Assistant Bot**: Added complete farmer action support including:
  - Product description management
  - Batch suspension capabilities  
  - Inspection history viewing
  - Batch recommendations
  - Enhanced UI with responsive function cards
- **Improved Form UX**: Removed wallet address field from registration/profile for streamlined onboarding

### Enhanced Consumer Experience  
- **Direct Camera QR Scanning**: One-click camera access for QR code scanning (no file upload required)
- **Cleaner Trace View**: Filtered out 'N/A' stakeholders from consumer trace for better readability
- **Enhanced Multilingual Support**: Fixed translation keys and ensured consistent language rendering

### Bot & Translation Improvements
- **Complete Farmer Actions**: Bot now supports all 12 farmer operations with proper flow handling
- **Fixed Translation System**: Resolved incorrect translations and added missing keys for all supported languages
- **Improved UI Layout**: Enhanced function cards with better spacing, hover effects, and responsive design
- **Language Consistency**: Audited and fixed hardcoded text across all components

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
Install all required Python packages (Django, DRF, JWT, PIL, and Blockchain tools):
```powershell
pip install -r requirements.txt
pip install web3>=6.0.0 eth-account>=0.8.0 eth-abi>=4.0.0 python-dotenv>=1.0.0
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
python manage.py runserver 0.0.0.0:8001
```

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

### C. Blockchain Configuration

The blockchain integration provides tamper-proof audit trails for critical events.

#### 1. Configure Environment Variables
Create `.env` file in `Backend/bsas_supplychain-main/`:
```bash
# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
HASH_ANCHOR_CONTRACT_ADDRESS=0x545302340823504C32268b64284728a6278083c7
ANCHORER_PRIVATE_KEY=0x...  # Private key with test MATIC
```

#### 2. Funding the Wallet (MANDATORY)
The anchorer wallet must have **MATIC** on the Polygon Amoy testnet to pay for gas fees.
- **Wallet Address**: `0x54D8B7D4C3FCA9e2a6341F3aB4D24d2c1812f406`
- **Faucet**: Get free test MATIC from the [Polygon Amoy Faucet](https://faucet.polygon.technology/).

#### 3. Why is "Data Integrity Failed" shown?
If you see "Data Integrity Failed" on a new batch, it is usually because:
1.  **Insufficient Funds**: The anchorer wallet has 0 MATIC and cannot write the fingerprint to the blockchain.
2.  **Not Yet Anchored**: The transaction is still being processed by the blockchain.
3.  **Data Mismatch**: The data in the database has been changed since it was anchored.

For more details, see [blockchain_implementation.md](./blockchain_implementation.md).


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
