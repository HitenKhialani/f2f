# AgriChain - Frontend-Backend Integration Guide

## Overview
This guide explains how the frontend (React + Vite) integrates with the backend (Django + DRF) for authentication and data flow.

## Architecture

### Backend (Django REST Framework)
- **Location**: `c:\Users\hiten\OneDrive\Desktop\Final Year Project\Backend\bsas_supplychain-main`
- **Framework**: Django + Django REST Framework
- **Authentication**: JWT (JSON Web Tokens) using `djangorestframework-simplejwt`
- **CORS**: Enabled for frontend communication
- **Database**: SQLite (default)

### Frontend (React + Vite)
- **Location**: `c:\Users\hiten\OneDrive\Desktop\Final Year Project\Frontend\agri-supply-chain`
- **Framework**: React 18 with Vite
- **HTTP Client**: Axios
- **State Management**: React Context (AuthContext)
- **Styling**: Tailwind CSS

---

## How It Works

### 1. Authentication Flow

#### Registration Flow:
1. User fills registration form (username, email, password, role, phone, organization, address)
2. Frontend sends POST to `/api/auth/register/`
3. Backend creates:
   - Django User (username, email, password)
   - StakeholderProfile (user, role, phone, organization, address, kyc_status='PENDING')
   - KYCRecord (profile, status='PENDING')
4. Returns success message
5. Frontend redirects to `/kyc-pending`

#### Login Flow:
1. User enters email and password
2. Frontend sends POST to `/api/auth/login/`
3. Backend validates credentials
4. Backend generates JWT tokens (access + refresh)
5. Returns: `{token, refresh, user, role, kyc_status}`
6. Frontend stores tokens in localStorage
7. Frontend routes based on `kyc_status`:
   - `PENDING` → `/kyc-pending`
   - `REJECTED` → `/kyc-rejected`
   - `APPROVED` → `/{role}/dashboard`

#### Authenticated Requests:
1. Frontend gets access token from localStorage
2. Adds header: `Authorization: Bearer <token>`
3. Backend validates JWT and returns data
4. If token expires (401), frontend redirects to login

#### Logout Flow:
1. Frontend sends refresh token to `/api/auth/logout/`
2. Backend blacklists the refresh token
3. Frontend clears localStorage tokens
4. Redirects to `/login`

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get JWT tokens |
| POST | `/api/auth/logout/` | Logout and blacklist token |
| GET | `/api/auth/me/` | Get current user data |

### Data Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/stakeholders/` | List/Create stakeholders |
| GET/POST | `/api/kyc-records/` | List/Create KYC records |
| GET/POST | `/api/crop-batches/` | List/Create crop batches |
| GET/POST | `/api/transport-requests/` | List/Create transport requests |
| GET/POST | `/api/inspection-reports/` | List/Create inspection reports |
| GET/POST | `/api/retail-listings/` | List/Create retail listings |
| GET/POST | `/api/consumer-scans/` | List/Create consumer scans |

---

## How to Run Both Servers

### Step 1: Start the Backend (Terminal 1)
```powershell
cd "c:\Users\hiten\OneDrive\Desktop\Final Year Project\Backend\bsas_supplychain-main"

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies (first time or after requirements.txt changes)
pip install -r requirements.txt

# Run migrations (first time or after model changes)
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```

Backend will be available at: `http://localhost:8000`
Admin panel at: `http://localhost:8000/admin/`

### Step 2: Start the Frontend (Terminal 2)
```powershell
cd "c:\Users\hiten\OneDrive\Desktop\Final Year Project\Frontend\agri-supply-chain"

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Data Models

### User (Django Built-in)
- `id`, `username`, `email`, `password`

### StakeholderProfile
- `user` (OneToOne to User)
- `role`: farmer, transporter, distributor, retailer, consumer, admin
- `organization`: Company/Farm/Shop name
- `phone`: Phone number
- `address`: Full address
- `wallet_id`: Blockchain wallet ID
- `kyc_status`: PENDING, APPROVED, REJECTED

### KYCRecord
- `profile` (ForeignKey to StakeholderProfile)
- `document_type`: Type of ID document
- `document_number`: Document ID number
- `document_file`: Uploaded document
- `status`: PENDING, APPROVED, REJECTED
- `verified_by`, `verified_at`

### CropBatch
- `farmer` (ForeignKey to StakeholderProfile)
- `crop_type`: Type of crop
- `quantity`: Amount in units
- `harvest_date`: Date of harvest
- `product_batch_id`: Auto-generated unique ID
- `qr_code_data`: Generated QR code data
- `organic_certificate`: Certificate file
- `quality_test_report`: Report file

---

## Environment Variables (Frontend)

Create `.env` file in frontend root if needed:
```
VITE_API_URL=http://localhost:8000/api
```

Default is already set in `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

---

## Common Issues & Solutions

### CORS Error
**Error**: `Access-Control-Allow-Origin` header missing
**Solution**: Ensure `corsheaders` middleware is in `settings.py` and `CORS_ALLOWED_ORIGINS` includes frontend URL.

### JWT Token Expired
**Error**: 401 Unauthorized
**Solution**: Frontend automatically redirects to `/login` when token expires. User needs to login again.

### Database Locked (SQLite)
**Error**: `database is locked`
**Solution**: Close all Django instances and restart. For production, use PostgreSQL.

### Port Already in Use
**Error**: `Address already in use`
**Solution**: Kill existing processes or change ports:
- Backend: `python manage.py runserver 0.0.0.0:8001`
- Frontend: Update `vite.config.js` or use `npm run dev -- --port 3000`

---

## Testing the Integration

### Test Registration:
1. Go to `http://localhost:5173/role-selection`
2. Select "Farmer"
3. Fill registration form
4. Submit
5. Should redirect to `/kyc-pending`
6. Check backend admin: `http://localhost:8000/admin/` - new user should appear

### Test Login:
1. Go to `http://localhost:5173/login`
2. Enter registered email and password
3. If KYC pending → `/kyc-pending`
4. If KYC approved → `/{role}/dashboard`

### Test Admin Approval (for KYC):
1. Login to Django admin: `http://localhost:8000/admin/`
2. Go to Supplychain → Stakeholder Profiles
3. Edit user profile, change `kyc_status` to `APPROVED`
4. User can now access dashboard

---

## Production Considerations

### Backend:
1. Change `SECRET_KEY` in `settings.py`
2. Set `DEBUG = False`
3. Configure `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Set up proper static/media file serving
6. Use environment variables for sensitive settings

### Frontend:
1. Update API URL to production backend
2. Build for production: `npm run build`
3. Serve built files via nginx or similar

---

## File Structure Summary

### Backend Files Modified/Created:
- `requirements.txt` - Added JWT and CORS packages
- `bsas_supplychain/settings.py` - Added JWT and CORS config
- `supplychain/models.py` - Updated models with new fields
- `supplychain/serializers.py` - Aligned with new models
- `supplychain/views.py` - Updated ViewSets
- `supplychain/auth_views.py` - **NEW** - Authentication views
- `urls.py` - Added auth routes

### Frontend Files Modified:
- `src/services/api.js` - Changed Token to Bearer
- `src/context/AuthContext.jsx` - Added refresh token handling

---

## Commands Reference

### Backend Commands:
```bash
# Setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Database
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Run
python manage.py runserver 0.0.0.0:8000

# Shell (for debugging)
python manage.py shell
```

### Frontend Commands:
```bash
# Setup
npm install

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## Next Steps for Development

1. **KYC Document Upload**: Add file upload endpoint for KYC documents
2. **Blockchain Integration**: Connect wallet_id to actual blockchain
3. **Email Notifications**: Add email for KYC approval/rejection
4. **Role-based Permissions**: Add more granular permissions per role
5. **Audit Logging**: Log all transactions for traceability
6. **QR Code Generation**: Implement QR code generation for batches
7. **Real-time Updates**: Add WebSocket for live notifications

---

## Support

For issues:
1. Check browser console for frontend errors
2. Check Django console for backend errors
3. Verify both servers are running on correct ports
4. Check network tab for API request/response details
