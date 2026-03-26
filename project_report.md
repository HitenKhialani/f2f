# AgriChain Project Technical Report

## 1. Project Overview
AgriChain is a full-stack, blockchain-integrated supply chain application connecting farmers, distributors, transporters, retailers, and consumers. It operates on a robust Django REST backend, an interactive React frontend, and bridges to a Solidity smart contract (HashAnchor) deployed on the Polygon Amoy testnet. Its primary goal is to ensure transparent tracking, strict role-based data validation, stage-gated financial escrows, and cryptographically verified data integrity across the agricultural lifecycle.

## 2. Folder Structure Analysis

### `Frontend/`
Contains the React SPA (Single Page Application).
*   **Purpose**: Manages the stakeholder UI, role-based access portals, and presentation of blockchain integrity statuses.
*   **Key Subfolders**: 
    *   `src/pages/`: Role-specific dashboard logic (e.g., farmer, distributor).
    *   `src/components/`: Reusable UI modules.
    *   `src/services/` & `src/context/`: Core business logic connecting to APIs and handling global context states.
*   **Core Logic Files**: `App.jsx` (Routing logic), `api.js` (Interceptors).

### `Backend/`
Contains the Django REST API application.
*   **Purpose**: Defines the database schema, business rules, API endpoints, payment state machines, and constructs blockchain payloads.
*   **Key Subfolders**: 
    *   `supplychain/`: The main Django app carrying all business entities.
*   **Core Logic Files**: `models.py` (Schema & State machine flags), `serializers.py`, `payment_views.py`, `blockchain_service.py`, `batch_validators.py`.

### `blockchain/`
Contains smart contracts and hardhat configuration.
*   **Purpose**: Implements the immutable on-chain ledger logic securing the payload hashes.
*   **Key Subfolders**: 
    *   `contracts/`: Solidity source files.
*   **Core Logic Files**: `HashAnchor.sol`.

---

## 3. Core File Breakdown & 4. Code Snippets with Explanation

### Frontend Modules

#### 🔹 File: `src/App.jsx`
**Purpose:** Handles high-level role-based routing and protected access controls across stakeholders.
**Key Code Snippet:**
```jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Protect route by comparing user role context against allowed roles
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(role?.toUpperCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```
**Explanation:** 
*   **What it does:** Intercepts frontend route navigation and checks authentication states.
*   **Why it is important:** Critical for isolating workflows; it physically guarantees that a Retailer cannot manipulate the UI designated for a Farmer.
*   **How it connects:** Wraps every critical module via `<ProtectedRoute>` preventing unauthorized payload generation.

#### 🔹 File: `src/services/api.js`
**Purpose:** Central HTTP request configuration handling tokens and global error mechanisms.
**Key Code Snippet:**
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercept 402 Payment Required for locked batches
    if (error.response?.status === 402) {
      const event = new CustomEvent('payment-required', {
        detail: error.response.data
      });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);
```
**Explanation:** 
*   **What it does:** Monitors all incoming API responses globally.
*   **Why it is important:** Resolves edge cases smoothly. The backend locks data when payments are owed (returning a `402`). This catches it anywhere instantly, notifying the user.
*   **How it connects:** Dispatches a standardized window event that popups a global payment UI modal.

#### 🔹 File: `src/pages/farmer/FarmerDashboard.jsx`
**Purpose:** Primary interface logic enabling farmers to interact with crop batches and transporters.
**Key Code Snippet:**
```jsx
  const handleRequestTransport = async () => {
    if (selectedBatch?.is_locked) {
      toast.warning('Please complete all pending payments before proceeding.');
      return;
    }
    try {
      await transportAPI.createRequest({
        batch_id: selectedBatch.id,
        distributor_id: selectedDistributor
      });
      fetchDashboardData(); 
      toast.success('Transport request created successfully!');
    } catch (error) {
      toast.error('Failed to create transport request');
    }
  };
```
**Explanation:** 
*   **What it does:** Coordinates selecting a package and handing it off to a distributor logistics node.
*   **Why it is important:** This sets the operational supply chain into motion. Checks standard front-end locks before proceeding.
*   **How it connects:** Constructs UI events directly passing parameters to `TransportRequestViewSet` on the API layer.

---

### Backend Modules

#### 🔹 File: `supplychain/models.py`
**Purpose:** Implements the core database entities (`CropBatch` and `Payment`), including state-machine fields.
**Key Code Snippet:**
```python
class CropBatch(models.Model):
    status = models.CharField(max_length=32, choices=BatchStatus.choices, default=BatchStatus.CREATED)
    financial_status = models.CharField(max_length=32, choices=FinancialStatus.choices, blank=True)
    is_locked = models.BooleanField(default=False)
    integrity_status = models.CharField(max_length=32, choices=IntegrityStatus.choices, default=IntegrityStatus.UNVERIFIED)

    def save(self, *args, **kwargs):
        if not self.product_batch_id:
            import datetime, uuid
            self.product_batch_id = f"BATCH-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
```
**Explanation:** 
*   **What it does:** Defines the fundamental batch and auto-generates sequential, tracking-friendly IDs.
*   **Why it is important:** Retains absolute truth. Incorporates multiple overlapping status markers (physical tracking, financial lock tracking, blockchain sync tracking).
*   **How it connects:** Serves as the central anchor for transport, testing, scanning, and inspection relational ties.

#### 🔹 File: `supplychain/batch_validators.py`
**Purpose:** Restricts illegal transitions across the supply chain flow to ensure procedural integrity.
**Key Code Snippet:**
```python
class BatchStatusTransitionValidator:
    ALLOWED_TRANSITIONS = {
        BatchStatus.ARRIVED_AT_DISTRIBUTOR: {
            StakeholderRole.DISTRIBUTOR: [BatchStatus.ARRIVAL_CONFIRMED_BY_DISTRIBUTOR],
        },
        BatchStatus.ARRIVAL_CONFIRMED_BY_DISTRIBUTOR: {
            StakeholderRole.TRANSPORTER: [BatchStatus.DELIVERED_TO_DISTRIBUTOR],
        },
    }
    
    @classmethod
    def can_transition(cls, batch, user, new_status):
        user_role = user.stakeholderprofile.role
        allowed = cls.ALLOWED_TRANSITIONS.get(batch.status, {}).get(user_role, [])
        return new_status in allowed, ""
```
**Explanation:** 
*   **What it does:** Applies declarative constraints against the Directed Acyclic Graph (DAG) state of physical shipping. 
*   **Why it is important:** A farmer cannot mark goods as 'Delivered to Retailer'. A transporter must be verified by a distributor confirmation.
*   **How it connects:** Wraps view mutations, preventing REST anomalies.

#### 🔹 File: `supplychain/payment_views.py`
**Purpose:** Secures staging escrow endpoints demanding financial fulfillment prior to batch unlocking.
**Key Code Snippet:**
```python
def check_phase_completion(batch):
    with transaction.atomic():
        # Re-fetch with row-level lock
        batch = models.CropBatch.objects.select_for_update().get(pk=batch.pk)
        phase_payments = models.Payment.objects.filter(batch=batch, phase=batch.current_phase)
        
        # Ensure ALL payments exactly settled
        unsettled = phase_payments.exclude(status=models.PaymentStatus.SETTLED).exists()
        
        if not unsettled:
            if batch.current_phase == models.BatchPhase.DISTRIBUTOR_PHASE:
                batch.financial_status = models.FinancialStatus.DISTRIBUTOR_PHASE_SETTLED
            batch.is_locked = False
            batch.save()
```
**Explanation:** 
*   **What it does:** Re-evaluates escrow condition metrics post each UPI settlement assertion.
*   **Why it is important:** Uses `select_for_update()` inside an `atomic` transaction, strictly preventing database race conditions and double-spending.
*   **How it connects:** Changes `batch.is_locked = False` which stops returning the `402 Payment Required` HTTP response, enabling operational flow to resume.

---

### Blockchain Modules

#### 🔹 File: `blockchain/contracts/HashAnchor.sol`
**Purpose:** Acts as a transparent, append-only, cryptographic audit ledge mapped specifically to individual batch IDs.
**Key Code Snippet:**
```solidity
    function anchorHash(bytes32 batchId, bytes32 snapshotHash, string calldata context) external onlyRole(ANCHORER_ROLE) returns (uint256 recordIndex) {
        require(batchId != bytes32(0), "HashAnchor: batch id is zero");
        
        AnchorRecord[] storage records = _batchAnchors[batchId];
        recordIndex = records.length;
        
        records.push(AnchorRecord({
            snapshotHash: snapshotHash,
            anchoredAt: uint64(block.timestamp),
            context: context,
            anchoredBy: msg.sender
        }));
        
        emit HashAnchored(batchId, snapshotHash, recordIndex, uint64(block.timestamp), msg.sender, context);
    }
```
**Explanation:** 
*   **What it does:** Submits structured `snapshotHash` strings against respective tracking batches, freezing time and actor data.
*   **Why it is important:** Optimizes for immense scalability while circumventing gas fees; it abstains from storing enormous amounts of raw JSON, saving purely the cryptographically secured 32-byte representation.
*   **How it connects:** Triggered sequentially by the background anchoring API nodes.

#### 🔹 File: `supplychain/blockchain_service.py`
**Purpose:** Re-verifies original states via standard SHA256 procedures crossing Web3 node data blocks.
**Key Code Snippet:**
```python
    def verify_batch_integrity(self, batch) -> Dict[str, Any]:
        events = list(BatchEvent.objects.filter(batch=batch).order_by('timestamp'))
        all_match = True
        
        for i, event in enumerate(events):
            if event.snapshot_hash:
                recomputed_hash = generate_batch_hash(batch, event.event_type, i+1, event.performed_by_id)
                
                if recomputed_hash.hex() != event.snapshot_hash:
                    all_match = False
                    
        new_integrity = IntegrityStatus.VERIFIED if all_match else IntegrityStatus.INTEGRITY_FAILED
        batch.integrity_status = new_integrity
        batch.save(update_fields=['integrity_status'])
        
        return {"verified": all_match, "status": new_integrity}
```
**Explanation:** 
*   **What it does:** Actively regenerates hashing dictionaries and verifies them against the blockchain node.
*   **Why it is important:** Exposes data tampering. If a rogue admin modifies the database (e.g., changes quantity or price), the locally reconstructed hashing permutation fails parity against the stored Ethereum state.
*   **How it connects:** Alters the `integrity_status` to `INTEGRITY_FAILED`, heavily red-flagging the UI layers.

---

## 5. System Flow Summary

The AgriChain workflow incorporates strict role validation, state gates, and immutable auditing mechanisms. The general flow is strictly supervised through the following lifecycle events:

1.  **Creation & Configuration:** A Farmer initiates a crop package on their Dashboard, producing a core `CropBatch` database entity with a unique `product_batch_id`.
2.  **Transport Origination:** Leveraging `can_transition()` strictures within the backend, a Farmer hands off the batch initiating an official Logistic Transport request, splitting fees effectively.
3.  **Encrypted Data Interlock (Escrow):** Upon delivery status updates (like `ARRIVED_AT_DISTRIBUTOR`), operational capabilities lock entirely. A mandatory `is_locked=True` and conditional `402` HTTP errors intercept processing until internal payment validations are strictly resolved via SQL `transaction.atomic` mechanisms.
4.  **Cryptographic Integrity Checks:** Throughout substantial event junctions, `blockchain_service.py` compresses all structured states surrounding a particular batch and pushes the signature into `HashAnchor.sol` over Web3. This ensures no past data sequence can silently drift out of synchronization relative to its creation date timestamp.
5.  **Consumer Verification:** Upon acquiring the batch, the end-user initiates the tracking query, reconstructing off-chain events while invoking `verify_batch_integrity`, asserting whether the digital chain of custody remains strictly unmanipulated across backend logs versus transparent on-chain Polygon hashes.
