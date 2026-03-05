# BLOCKCHAIN_INTEGRATION_TASK_LIST

## Current Implementation Status

**✅ COMPLETED**:
- HashAnchor.sol smart contract with AccessControl
- Hardhat development framework
- Polygon Amoy testnet configuration (Chain ID: 80002)
- TypeChain generated TypeScript interfaces
- Deployment scripts and environment setup

**❌ MISSING**:
- Backend blockchain integration (web3.py)
- Hash generation module
- Blockchain service layer
- Database schema updates for blockchain references
- API endpoints for anchoring and verification

---

## Task Breakdown - Execution Order

### Task 1: Install Python Dependencies
**Priority**: HIGH | **Estimated Time**: 15 minutes

**Actions**:
```bash
cd Backend/bsas_supplychain-main
pip install web3>=6.0.0 eth-account>=0.8.0 eth-abi>=4.0.0 python-dotenv>=1.0.0
```

**Files to Update**:
- `requirements.txt` - Add blockchain dependencies

**Verification**:
```bash
pip freeze | grep -E "(web3|eth-account|eth-abi|python-dotenv)"
```

---

### Task 2: Create Hash Generation Module
**Priority**: HIGH | **Estimated Time**: 45 minutes

**File to Create**: `supplychain/hash_generator.py`

**Required Functions**:
```python
def generate_batch_hash(batch: CropBatch) -> bytes
def generate_canonical_data(batch: CropBatch) -> dict
def validate_hash_format(hash_bytes: bytes) -> bool
```

**Implementation Requirements**:
- Use SHA256 algorithm
- Create deterministic JSON representation
- Include batch_id, status, quantity, events, timestamps
- Return 32-byte hash for blockchain compatibility

**Test Cases**:
- Same batch data produces same hash
- Different data produces different hash
- Hash format validation

---

### Task 3: Create Blockchain Service Module
**Priority**: HIGH | **Estimated Time**: 60 minutes

**File to Create**: `supplychain/blockchain_service.py`

**Required Class**:
```python
class BlockchainService:
    def __init__(self)
    def anchor_batch_hash(self, batch_id: str, hash_bytes: bytes, context: str) -> dict
    def get_latest_anchor(self, batch_id: str) -> dict
    def verify_batch_integrity(self, batch: CropBatch) -> dict
    def get_anchor_count(self, batch_id: str) -> int
```

**Implementation Requirements**:
- Web3 connection to Polygon Amoy
- Contract ABI integration
- Private key management (environment variables)
- Gas estimation and transaction handling
- Error handling and retry logic

**Environment Variables**:
- `POLYGON_AMOY_RPC_URL`
- `HASH_ANCHOR_CONTRACT_ADDRESS`
- `ANCHORER_PRIVATE_KEY`

---

### Task 4: Update Database Schema
**Priority**: HIGH | **Estimated Time**: 30 minutes

**Files to Update**:
- `supplychain/models.py` - Add blockchain fields to existing models

**Required Fields**:
```python
# Add to BatchEvent model
blockchain_tx_hash = models.CharField(max_length=128, blank=True, null=True)
blockchain_block_number = models.BigIntegerField(blank=True, null=True)
snapshot_hash = models.CharField(max_length=64, blank=True, null=True)

# Add to CropBatch model
last_anchored_at = models.DateTimeField(blank=True, null=True)
is_blockchain_verified = models.BooleanField(default=False)
```

**Actions**:
1. Add fields to models
2. Create and run migration:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

---

### Task 5: Create Blockchain API Endpoints
**Priority**: HIGH | **Estimated Time**: 45 minutes

**File to Create**: `supplychain/blockchain_views.py`

**Required Views**:
```python
class AnchorBatchView(APIView)
class VerifyBatchView(APIView)
class BatchAnchorsListView(APIView)
class BlockchainStatusView(APIView)
```

**Endpoints to Add**:
- `POST /api/batch/{id}/anchor/` - Manually trigger anchoring
- `GET /api/batch/{id}/verify/` - Verify data integrity
- `GET /api/batch/{id}/anchors/` - List all blockchain anchors
- `GET /api/blockchain/status/` - System blockchain status

**File to Update**: `urls.py` - Add new routes

---

### Task 6: Integrate Blockchain with Event Logger
**Priority**: MEDIUM | **Estimated Time**: 30 minutes

**File to Update**: `supplychain/event_logger.py`

**Integration Points**:
```python
def log_batch_event(batch, event_type, user, metadata=None):
    # ... existing code ...
    
    # NEW: Auto-anchor critical events
    if event_type in CRITICAL_BLOCKCHAIN_EVENTS:
        try:
            blockchain = BlockchainService()
            batch_hash = generate_batch_hash(batch)
            tx_receipt = blockchain.anchor_batch_hash(
                batch.product_batch_id,
                batch_hash,
                event_type
            )
            
            # Update event with blockchain data
            event.blockchain_tx_hash = tx_receipt.transactionHash.hex()
            event.blockchain_block_number = tx_receipt.blockNumber
            event.snapshot_hash = batch_hash.hex()
            event.save()
            
        except Exception as e:
            # Log error but don't fail the event
            logger.error(f"Blockchain anchoring failed: {e}")
    
    return event
```

**Critical Events to Anchor**:
- `CREATED`
- `DELIVERED_TO_DISTRIBUTOR`
- `DELIVERED_TO_RETAILER`
- `SOLD`

---

### Task 7: Update Serializers for Blockchain Fields
**Priority**: MEDIUM | **Estimated Time**: 20 minutes

**File to Update**: `supplychain/serializers.py`

**Required Updates**:
- Add blockchain fields to BatchEvent serializer
- Add blockchain fields to CropBatch serializer
- Include blockchain verification status in API responses

**Fields to Add**:
```python
# In BatchEventSerializer
blockchain_tx_hash = serializers.CharField(read_only=True)
blockchain_block_number = serializers.IntegerField(read_only=True)
snapshot_hash = serializers.CharField(read_only=True)

# In CropBatchSerializer
last_anchored_at = serializers.DateTimeField(read_only=True)
is_blockchain_verified = serializers.BooleanField(read_only=True)
```

---

### Task 8: Create Environment Configuration
**Priority**: MEDIUM | **Estimated Time**: 15 minutes

**File to Create**: `.env` (in Backend/bsas_supplychain-main/)

**Required Variables**:
```bash
# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
HASH_ANCHOR_CONTRACT_ADDRESS=0x... # Deployed contract address
ANCHORER_PRIVATE_KEY=0x... # Secure key management

# Optional: Gas Settings
MAX_GAS_PRICE=50000000000  # 50 gwei
GAS_LIMIT=200000
```

**File to Update**: `settings.py` - Load environment variables

---

### Task 9: Add Error Handling and Logging
**Priority**: MEDIUM | **Estimated Time**: 25 minutes

**Files to Update**:
- `blockchain_service.py` - Add comprehensive error handling
- `event_logger.py` - Add blockchain error logging

**Error Scenarios to Handle**:
- Network connectivity issues
- Insufficient gas
- Contract call failures
- Transaction timeouts
- Invalid private keys

**Logging Requirements**:
- Log all blockchain transactions
- Log failed anchoring attempts
- Monitor gas costs
- Alert on repeated failures

---

### Task 10: Create Unit Tests
**Priority**: LOW | **Estimated Time**: 90 minutes

**Files to Create**:
- `tests/test_hash_generator.py`
- `tests/test_blockchain_service.py`
- `tests/test_blockchain_views.py`

**Test Coverage**:
- Hash generation consistency
- Blockchain service methods
- API endpoint responses
- Error handling scenarios
- Integration with event logger

**Test Requirements**:
- Mock Web3 calls for unit tests
- Use local Hardhat network for integration tests
- Test with real contract on testnet

---

### Task 11: Update Consumer Verification API
**Priority**: LOW | **Estimated Time**: 30 minutes

**File to Update**: `supplychain/consumer_views.py`

**Enhancement to BatchTraceView**:
```python
def get(self, request, public_id):
    # ... existing code ...
    
    # NEW: Add blockchain verification
    blockchain_verification = None
    if batch.is_blockchain_verified:
        blockchain = BlockchainService()
        blockchain_verification = blockchain.verify_batch_integrity(batch)
    
    response_data = {
        # ... existing fields ...
        "blockchain_verification": blockchain_verification
    }
```

---

### Task 12: Create Monitoring and Metrics
**Priority**: LOW | **Estimated Time**: 45 minutes

**File to Create**: `supplychain/blockchain_monitoring.py`

**Monitoring Features**:
- Track anchoring success rate
- Monitor gas costs
- Alert on failed transactions
- Daily blockchain status reports

**Metrics to Track**:
- Total anchors per day
- Average gas cost
- Failed anchoring attempts
- Verification request count

---

## Implementation Dependencies

```
Task 1 (Dependencies) → Task 2, 3, 8
Task 2 → Task 3, 6
Task 3 → Task 5, 6, 11
Task 4 → Task 5, 6, 7, 11
Task 5 → Task 7, 10
Task 6 → Task 10
Task 7 → Task 10
Task 8 → Task 3, 9
Task 9 → Task 10
Task 10 → Task 11, 12
Task 11 → Task 12
```

## Estimated Total Timeline

**Critical Path (Tasks 1-6)**: 4-5 hours
**Full Implementation (Tasks 1-12)**: 8-10 hours
**Testing and Deployment**: Additional 2-3 hours

## Success Criteria

1. ✅ Batch events automatically anchor to blockchain
2. ✅ Consumers can verify data integrity via API
3. ✅ All blockchain transactions logged and monitored
4. ✅ Error handling prevents system failures
5. ✅ Gas costs tracked and optimized
6. ✅ Unit tests cover all blockchain functionality
