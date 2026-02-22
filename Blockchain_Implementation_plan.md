# Blockchain Implementation Blueprint for AgriChain

## A Complete Technical Reference for Web3 Integration

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Blockchain Architecture Design](#3-blockchain-architecture-design)
4. [Smart Contract Specifications](#4-smart-contract-specifications)
5. [Integration Layer Design](#5-integration-layer-design)
6. [Data Migration Strategy](#6-data-migration-strategy)
7. [Security Architecture](#7-security-architecture)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Cost Analysis](#9-cost-analysis)
10. [Risk Assessment & Mitigation](#10-risk-assessment--mitigation)
11. [Appendices](#11-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

This document provides a comprehensive technical blueprint for integrating Ethereum blockchain technology into the AgriChain agricultural supply chain management system. The goal is to transform the current Web2 application into a hybrid Web2/Web3 system that leverages blockchain's immutability, transparency, and trustless verification while maintaining the usability and performance of the existing application.

### 1.2 Vision

**Current State**: AgriChain operates as a centralized Web2 application with role-based access control, JWT authentication, and a SQLite/PostgreSQL database storing all supply chain events.

**Target State**: A hybrid architecture where:
- Critical supply chain events are anchored to the Ethereum blockchain
- Batch ownership and transfers are recorded immutably
- Stakeholders have verifiable on-chain identities
- Consumers can verify product authenticity independently
- Smart contracts automate compliance and payments

### 1.3 Scope

**In Scope**:
- Smart contract suite for supply chain management
- Web3 integration layer for Django backend
- Wallet connectivity for 6 stakeholder roles
- Batch lifecycle anchoring to blockchain
- Event synchronization between Web2 and Web3
- Token-based incentive mechanisms (future)

**Out of Scope (Phase 1)**:
- Full decentralization of data storage (IPFS/Filecoin)
- Cross-chain interoperability
- DAO governance implementation
- Native cryptocurrency creation

### 1.4 Success Criteria

| Metric | Target |
|--------|--------|
| Transaction Finality | < 30 seconds on L2 |
| Gas Cost per Event | < $0.50 USD |
| System Availability | 99.9% uptime |
| Data Integrity | 100% event anchoring |
| User Adoption | 80% wallet connection rate |

---

## 2. Current Architecture Analysis

### 2.1 Data Model Mapping

The current Django models map to the following blockchain concepts:

| Web2 Entity | Blockchain Equivalent | Notes |
|-------------|----------------------|-------|
| `StakeholderProfile` | On-chain Identity (DID/ENS) | Wallet address becomes primary identifier |
| `CropBatch` | NFT or Tokenized Asset | Each batch becomes a unique token |
| `BatchEvent` | Blockchain Event Log | Every status change = transaction |
| `TransportRequest` | Smart Contract State | Escrow and tracking in contract |
| `RetailListing` | Marketplace Listing | On-chain listing with price oracle |
| `BatchSplit` | Token Fractionalization | ERC-1155 for split batches |

### 2.2 State Machine Analysis

Current batch status transitions (`BatchStatus` enum):

```
CREATED → TRANSPORT_REQUESTED → IN_TRANSIT_TO_DISTRIBUTOR 
→ DELIVERED_TO_DISTRIBUTOR → STORED → TRANSPORT_REQUESTED_TO_RETAILER 
→ IN_TRANSIT_TO_RETAILER → DELIVERED_TO_RETAILER → LISTED → SOLD
```

**Key Observations**:
- 18 distinct states in the current model
- Ownership transfers occur at 2 points (delivery confirmations)
- Events are sequential with some parallel possibilities (inspections)
- SUSPENDED state acts as a circuit breaker

### 2.3 Actor Analysis

| Role | Current Permissions | Blockchain Role |
|------|---------------------|-----------------|
| Farmer | Create batches, request transport | Token minter, initial owner |
| Transporter | Accept/reject/deliver | Escrow participant, delivery oracle |
| Distributor | Store, inspect, request onward | Token receiver, inspector role |
| Retailer | List, sell, mark sold | Marketplace participant, seller |
| Consumer | Trace, scan | Token holder (future), verifier |
| Admin | KYC, user management | Contract owner, role admin |

### 2.4 Critical Events for Anchoring

**Must Anchor** (High Value, Low Volume):
- Batch creation (token minting)
- Ownership transfers (2 per batch lifecycle)
- Final sale confirmation
- Suspension/un-suspension

**Should Anchor** (Medium Value, Medium Volume):
- Transport request/acceptance
- Delivery confirmations
- Retail listing creation

**Could Anchor** (Low Value, High Volume):
- Inspection reports
- Dashboard statistics
- Inventory queries

---

## 3. Blockchain Architecture Design

### 3.1 Network Selection

**Primary Network**: Ethereum Layer 2 (Polygon PoS or Arbitrum)

**Rationale**:
- L2 provides 10-100x cost reduction vs Ethereum mainnet
- EVM compatibility for Solidity contracts
- Mature tooling ecosystem
- Fast finality (2-3 seconds for Polygon)

**Fallback Strategy**:
- Local hardhat network for development
- Sepolia testnet for staging
- Mainnet for high-value provenance (optional)

### 3.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Farmer     │  │ Distributor  │  │   Consumer   │           │
│  │    Wallet    │  │    Wallet    │  │   (Read Only)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Django Web3 Bridge Service                 │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │    │
│  │  │ Wallet Auth│ │  Event     │ │ Transaction│         │    │
│  │  │  Service   │ │  Listener  │ │  Manager   │         │    │
│  │  └────────────┘ └────────────┘ └────────────┘         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   AgriToken  │  │  SupplyChain │  │   Registry   │           │
│  │   Contract   │  │   Contract   │  │   Contract   │           │
│  │  (ERC-1155)  │  │  (Workflow)  │  │  (Addresses) │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Payment    │  │   Access     │  │   Event      │           │
│  │   Escrow     │  │   Control    │  │   Logger     │           │
│  │   Contract   │  │   Contract   │  │   Contract   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Contract Ecosystem

#### 3.3.1 Core Contracts

**1. AgriToken (ERC-1155 Multi-Token Standard)**

Purpose: Represent crop batches and their splits

Key Features:
- Batch as unique token ID
- Split batches as fractional tokens
- Metadata URI linking to off-chain data
- Transfer with role validation
- Batch merging capability (burn and mint)

**2. SupplyChainMaster (Main Workflow Contract)**

Purpose: Orchestrate the entire supply chain lifecycle

Key Features:
- State machine enforcement (matching Web2 logic)
- Actor validation (role-based permissions)
- Automatic event emission
- Integration with AgriToken for ownership
- Escrow coordination

**3. StakeholderRegistry**

Purpose: On-chain identity and KYC verification

Key Features:
- Wallet address → Role mapping
- KYC status attestation
- Reputation scoring (future)
- Delegation mechanisms

**4. PaymentEscrow**

Purpose: Secure payment handling between parties

Key Features:
- Multi-party escrow
- Conditional release (delivery confirmation)
- Dispute resolution mechanism
- Integration with stablecoins (USDC/USDT)

**5. EventAnchor**

Purpose: Immutable event logging for audit trails

Key Features:
- Structured event storage
- Merkle proof generation
- Timestamp anchoring
- Cross-reference with BatchEvent table

### 3.4 Data Flow Patterns

#### 3.4.1 Write Flow (Web2 → Blockchain)

```
1. User action in React Frontend
2. Django API receives request
3. Business logic validation (Web2)
4. Database transaction (SQLite/PostgreSQL)
5. Web3 Bridge prepares blockchain transaction
6. Meta-transaction or direct wallet signing
7. Transaction broadcast to L2
8. Confirmation wait (2-3 blocks)
9. Event emitted on-chain
10. Django updates `tx_hash` in database
11. Frontend shows confirmation
```

#### 3.4.2 Read Flow (Blockchain → Web2)

```
1. Consumer requests batch trace
2. Django queries local database (fast)
3. Optional: Verify on-chain state matches
4. Return combined on-chain + off-chain data
5. Frontend displays with blockchain verification badge
```

#### 3.4.3 Event Sync Flow

```
1. Background worker polls blockchain
2. Detects new events since last sync
3. Parses event data
4. Updates Django database (idempotent)
5. Triggers notifications if needed
6. Logs sync checkpoint
```

---

## 4. Smart Contract Specifications

### 4.1 Contract: AgriToken (ERC-1155)

#### 4.1.1 Interface Definition

```solidity
interface IAgriToken {
    // Token lifecycle
    function mintBatch(
        address to,
        uint256 quantity,
        string memory cropType,
        string memory metadataURI,
        bytes memory data
    ) external returns (uint256 batchId);
    
    function splitBatch(
        uint256 parentBatchId,
        uint256[] memory quantities,
        address[] memory recipients,
        string[] memory labels
    ) external returns (uint256[] memory childBatchIds);
    
    function mergeBatches(
        uint256[] memory batchIds,
        address recipient
    ) external returns (uint256 newBatchId);
    
    // Ownership tracking
    function getCurrentOwner(uint256 batchId) external view returns (address);
    function getOwnershipHistory(uint256 batchId) external view returns (address[] memory);
    
    // Batch validation
    function isValidBatch(uint256 batchId) external view returns (bool);
    function getBatchStatus(uint256 batchId) external view returns (BatchStatus);
    
    // Events
    event BatchMinted(uint256 indexed batchId, address indexed farmer, uint256 quantity);
    event BatchSplit(uint256 indexed parentId, uint256[] childIds);
    event BatchMerged(uint256[] mergedIds, uint256 newId);
    event OwnershipTransferred(uint256 indexed batchId, address from, address to);
}
```

#### 4.1.2 State Variables

```solidity
// Token storage
mapping(uint256 => BatchMetadata) public batchMetadata;
mapping(uint256 => address) public batchOwner;
mapping(uint256 => uint256[]) public ownershipHistory;
mapping(uint256 => uint256) public parentBatch; // child -> parent
mapping(uint256 => uint256[]) public childBatches; // parent -> children

// Counters
uint256 public nextBatchId;
uint256 public totalBatches;

// Access control
mapping(address => bool) public authorizedMinters;
mapping(address => bool) public authorizedTransporters;

// Structs
struct BatchMetadata {
    string cropType;
    uint256 quantity;
    uint256 createdAt;
    uint256 harvestDate;
    string farmLocation;
    string metadataURI;
    BatchStatus status;
    bool isChildBatch;
}

enum BatchStatus {
    CREATED,
    TRANSPORT_REQUESTED,
    IN_TRANSIT_TO_DISTRIBUTOR,
    DELIVERED_TO_DISTRIBUTOR,
    STORED,
    TRANSPORT_REQUESTED_TO_RETAILER,
    IN_TRANSIT_TO_RETAILER,
    DELIVERED_TO_RETAILER,
    LISTED,
    SOLD,
    SUSPENDED,
    FULLY_SPLIT
}
```

### 4.2 Contract: SupplyChainMaster

#### 4.2.1 Interface Definition

```solidity
interface ISupplyChainMaster {
    // Workflow functions
    function requestTransport(
        uint256 batchId,
        address transporter,
        address toParty,
        string memory vehicleDetails
    ) external;
    
    function acceptTransport(uint256 transportId) external;
    
    function confirmDelivery(
        uint256 transportId,
        string memory proofHash
    ) external;
    
    function storeBatch(uint256 batchId, string memory storageLocation) external;
    
    function createListing(
        uint256 batchId,
        uint256 pricePerUnit,
        uint256 quantity
    ) external returns (uint256 listingId);
    
    function markSold(uint256 listingId, address buyer) external;
    
    function suspendBatch(uint256 batchId, string memory reason) external;
    function unsuspendBatch(uint256 batchId) external;
    
    // Query functions
    function getBatchJourney(uint256 batchId) external view returns (TransportEvent[] memory);
    function getCurrentTransport(uint256 batchId) external view returns (uint256 transportId);
    function getListing(uint256 listingId) external view returns (Listing memory);
    
    // Events
    event TransportRequested(uint256 indexed batchId, uint256 transportId, address transporter);
    event TransportAccepted(uint256 indexed transportId, address transporter);
    event DeliveryConfirmed(uint256 indexed transportId, address confirmedBy, uint256 timestamp);
    event BatchStored(uint256 indexed batchId, address distributor, string location);
    event ListingCreated(uint256 indexed listingId, uint256 indexed batchId, uint256 price);
    event BatchSold(uint256 indexed listingId, address buyer, uint256 totalPrice);
    event BatchSuspended(uint256 indexed batchId, string reason);
}
```

#### 4.2.2 State Variables

```solidity
// Transport tracking
mapping(uint256 => Transport) public transports;
mapping(uint256 => uint256) public batchCurrentTransport;
uint256 public nextTransportId;

// Retail listings
mapping(uint256 => Listing) public listings;
uint256 public nextListingId;

// State machine tracking
mapping(uint256 => BatchStatus) public batchStatus;
mapping(uint256 => address) public batchCurrentOwner;

// References to other contracts
IAgriToken public agriToken;
IStakeholderRegistry public registry;
IPaymentEscrow public escrow;

// Structs
struct Transport {
    uint256 batchId;
    address requestedBy;
    address transporter;
    address fromParty;
    address toParty;
    TransportStatus status;
    string vehicleDetails;
    uint256 requestedAt;
    uint256 acceptedAt;
    uint256 deliveredAt;
    string deliveryProof;
}

struct Listing {
    uint256 batchId;
    address retailer;
    uint256 pricePerUnit;
    uint256 quantity;
    uint256 remaining;
    bool isActive;
    uint256 createdAt;
}

enum TransportStatus {
    PENDING,
    ACCEPTED,
    IN_TRANSIT,
    ARRIVED,
    CONFIRMED,
    REJECTED
}
```

### 4.3 Contract: StakeholderRegistry

#### 4.3.1 Interface Definition

```solidity
interface IStakeholderRegistry {
    // Registration
    function registerStakeholder(
        address wallet,
        StakeholderRole role,
        string memory organization,
        bytes32 kycHash
    ) external;
    
    function updateKYCStatus(address wallet, KYCStatus status) external;
    
    // Validation
    function isRegistered(address wallet) external view returns (bool);
    function getRole(address wallet) external view returns (StakeholderRole);
    function getKYCStatus(address wallet) external view returns (KYCStatus);
    function isApproved(address wallet) external view returns (bool);
    
    // Query
    function getStakeholder(address wallet) external view returns (Stakeholder memory);
    function getStakeholdersByRole(StakeholderRole role) external view returns (address[] memory);
    
    // Events
    event StakeholderRegistered(address indexed wallet, StakeholderRole role);
    event KYCUpdated(address indexed wallet, KYCStatus status);
}
```

#### 4.3.2 Enums and Structs

```solidity
enum StakeholderRole {
    NONE,
    FARMER,
    TRANSPORTER,
    DISTRIBUTOR,
    RETAILER,
    CONSUMER,
    ADMIN
}

enum KYCStatus {
    PENDING,
    APPROVED,
    REJECTED
}

struct Stakeholder {
    address wallet;
    StakeholderRole role;
    string organization;
    bytes32 kycHash;
    KYCStatus kycStatus;
    uint256 registeredAt;
    bool isActive;
}

// State
mapping(address => Stakeholder) public stakeholders;
mapping(StakeholderRole => address[]) public roleIndex;
address public admin;
```

### 4.4 Contract: PaymentEscrow

#### 4.4.1 Interface Definition

```solidity
interface IPaymentEscrow {
    // Escrow creation
    function createEscrow(
        uint256 batchId,
        address buyer,
        address seller,
        address transporter,
        uint256 amount,
        uint256 transporterFee
    ) external payable returns (uint256 escrowId);
    
    // Release conditions
    function releaseOnDelivery(uint256 escrowId) external;
    function releaseToSeller(uint256 escrowId) external;
    function refundBuyer(uint256 escrowId) external;
    
    // Dispute
    function raiseDispute(uint256 escrowId, string memory reason) external;
    function resolveDispute(uint256 escrowId, address winner) external;
    
    // Query
    function getEscrow(uint256 escrowId) external view returns (Escrow memory);
    
    // Events
    event EscrowCreated(uint256 indexed escrowId, uint256 batchId, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address to, uint256 amount);
    event DisputeRaised(uint256 indexed escrowId, string reason);
}
```

### 4.5 Contract: EventAnchor

#### 4.5.1 Interface Definition

```solidity
interface IEventAnchor {
    function anchorEvent(
        uint256 batchId,
        EventType eventType,
        address actor,
        bytes32 dataHash,
        string memory metadataURI
    ) external returns (uint256 eventId);
    
    function verifyEvent(uint256 eventId) external view returns (bool);
    function getBatchEvents(uint256 batchId) external view returns (uint256[] memory);
    function getEventData(uint256 eventId) external view returns (AnchoredEvent memory);
    
    enum EventType {
        CREATED,
        TRANSPORT_REQUESTED,
        TRANSPORT_ACCEPTED,
        DELIVERED,
        STORED,
        LISTED,
        SOLD,
        INSPECTED,
        SUSPENDED
    }
    
    struct AnchoredEvent {
        uint256 batchId;
        EventType eventType;
        address actor;
        bytes32 dataHash;
        string metadataURI;
        uint256 timestamp;
        uint256 blockNumber;
    }
}
```

### 4.6 Access Control Patterns

**Role Hierarchy**:
```
DEFAULT_ADMIN_ROLE
├── MINTER_ROLE (token creation)
├── TRANSPORTER_ROLE (delivery confirmation)
├── INSPECTOR_ROLE (quality verification)
├── SELLER_ROLE (listing creation)
└── ADMIN_ROLE (user management)
```

**OpenZeppelin Integration**:
- `AccessControl` for role management
- `Pausable` for emergency stops
- `ReentrancyGuard` for payment safety
- `UUPSUpgradeable` for contract upgrades

---

## 5. Integration Layer Design

### 5.1 Django Web3 Bridge Architecture

```python
# Layer Structure
┌─────────────────────────────────────────────────────┐
│              Django Web3 Bridge                      │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   Web3       │  │   Contract   │  │  Wallet    │  │
│  │   Provider   │  │   Manager    │  │  Service   │  │
│  │              │  │              │  │            │  │
│  │ - L2 RPC     │  │ - ABI loader │  │ - Nonce    │  │
│  │ - Connection │  │ - Address    │  │   mgmt     │  │
│  │   pool       │  │   registry   │  │ - Signing  │  │
│  │ - Retry      │  │ - Event      │  │ - Key      │  │
│  │   logic      │  │   decoder    │  │   storage  │  │
│  └──────────────┘  └──────────────┘  └────────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Transaction  │  │ Event          │               │
│  │ Service      │  │ Listener       │               │
│  │              │  │                │               │
│  │ - Gas est.   │  │ - Block poll   │               │
│  │ - Builder    │  │ - Filter       │               │
│  │ - Receipt    │  │ - Handler      │               │
│  │   handling   │  │   registry     │               │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

### 5.2 Core Service Classes

#### 5.2.1 Web3Provider Service

```python
# supplychain/web3_services/provider.py

from web3 import Web3
from django.conf import settings
import threading

class Web3Provider:
    """
    Manages Web3 connections to L2 networks.
    Implements connection pooling and failover.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.providers = []
        for rpc_url in settings.WEB3_RPC_URLS:
            provider = Web3(Web3.HTTPProvider(rpc_url))
            self.providers.append(provider)
        self.current_index = 0
    
    def get_w3(self) -> Web3:
        """Get current active provider with failover."""
        return self.providers[self.current_index]
    
    def switch_provider(self):
        """Rotate to next provider on failure."""
        self.current_index = (self.current_index + 1) % len(self.providers)
```

#### 5.2.2 ContractManager Service

```python
# supplychain/web3_services/contract_manager.py

from web3 import Web3
from eth_account import Account
import json
from pathlib import Path

class ContractManager:
    """
    Loads and manages smart contract instances.
    Handles ABI loading and address configuration.
    """
    
    CONTRACTS = {
        'AgriToken': 'AgriToken.json',
        'SupplyChainMaster': 'SupplyChainMaster.json',
        'StakeholderRegistry': 'StakeholderRegistry.json',
        'PaymentEscrow': 'PaymentEscrow.json',
        'EventAnchor': 'EventAnchor.json'
    }
    
    def __init__(self, web3: Web3, network: str = 'polygon'):
        self.w3 = web3
        self.network = network
        self._contracts = {}
        self._abis = {}
        self._load_configuration()
    
    def _load_configuration(self):
        """Load contract addresses and ABIs from deployment artifacts."""
        config_path = Path(f'contracts/deployments/{self.network}.json')
        with open(config_path) as f:
            self.deployment = json.load(f)
        
        abi_path = Path('contracts/abis')
        for name, filename in self.CONTRACTS.items():
            with open(abi_path / filename) as f:
                self._abis[name] = json.load(f)
    
    def get_contract(self, name: str) -> Web3.Contract:
        """Get contract instance by name."""
        if name not in self._contracts:
            address = self.deployment['contracts'][name]['address']
            self._contracts[name] = self.w3.eth.contract(
                address=address,
                abi=self._abis[name]
            )
        return self._contracts[name]
```

#### 5.2.3 TransactionService

```python
# supplychain/web3_services/transaction_service.py

from dataclasses import dataclass
from typing import Optional
from web3 import Web3
from web3.types import TxReceipt
import time

@dataclass
class TransactionResult:
    success: bool
    tx_hash: Optional[str]
    receipt: Optional[TxReceipt]
    error: Optional[str]
    gas_used: Optional[int]
    block_number: Optional[int]

class TransactionService:
    """
    Handles transaction building, gas estimation,
    nonce management, and receipt tracking.
    """
    
    def __init__(self, web3: Web3, contract_manager: ContractManager):
        self.w3 = web3
        self.contracts = contract_manager
        self.pending_nonces = {}
    
    def build_and_send(
        self,
        contract_name: str,
        function_name: str,
        args: tuple,
        from_address: str,
        private_key: Optional[str] = None,
        gas_limit: Optional[int] = None,
        use_meta_tx: bool = False
    ) -> TransactionResult:
        """
        Build and send a transaction to the blockchain.
        
        Supports both direct signing and meta-transactions.
        """
        try:
            contract = self.contracts.get_contract(contract_name)
            function = contract.functions[function_name](*args)
            
            # Estimate gas
            if not gas_limit:
                gas_limit = function.estimate_gas({'from': from_address})
            
            # Get nonce
            nonce = self._get_nonce(from_address)
            
            if use_meta_tx:
                # Build meta-transaction for relayer
                return self._send_meta_transaction(
                    function, from_address, nonce, gas_limit
                )
            else:
                # Direct transaction (requires private key)
                return self._send_direct_transaction(
                    function, from_address, private_key, nonce, gas_limit
                )
                
        except Exception as e:
            return TransactionResult(
                success=False,
                tx_hash=None,
                receipt=None,
                error=str(e),
                gas_used=None,
                block_number=None
            )
    
    def _send_direct_transaction(
        self,
        function,
        from_address: str,
        private_key: str,
        nonce: int,
        gas_limit: int
    ) -> TransactionResult:
        """Send transaction with direct signing."""
        tx = function.build_transaction({
            'from': from_address,
            'nonce': nonce,
            'gas': gas_limit,
            'maxFeePerGas': self.w3.to_wei('50', 'gwei'),
            'maxPriorityFeePerGas': self.w3.to_wei('2', 'gwei'),
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        return TransactionResult(
            success=receipt.status == 1,
            tx_hash=tx_hash.hex(),
            receipt=receipt,
            error=None,
            gas_used=receipt.gasUsed,
            block_number=receipt.blockNumber
        )
    
    def _get_nonce(self, address: str) -> int:
        """Get next nonce with pending tracking."""
        on_chain = self.w3.eth.get_transaction_count(address)
        pending = self.pending_nonces.get(address, on_chain)
        nonce = max(on_chain, pending)
        self.pending_nonces[address] = nonce + 1
        return nonce
```

#### 5.2.4 EventListener Service

```python
# supplychain/web3_services/event_listener.py

from web3 import Web3
from typing import Callable, Dict, List
from dataclasses import dataclass
import threading
import time

@dataclass
class EventFilter:
    contract_name: str
    event_name: str
    from_block: int
    to_block: int = 'latest'
    argument_filters: Dict = None

class EventListener:
    """
    Background service that polls for blockchain events
    and synchronizes them with Django database.
    """
    
    POLL_INTERVAL = 5  # seconds
    CONFIRMATION_BLOCKS = 2
    
    def __init__(self, web3: Web3, contract_manager: ContractManager):
        self.w3 = web3
        self.contracts = contract_manager
        self.handlers: Dict[str, Callable] = {}
        self.last_synced_block = 0
        self._running = False
        self._thread = None
    
    def register_handler(self, event_signature: str, handler: Callable):
        """Register a handler for a specific event."""
        self.handlers[event_signature] = handler
    
    def start(self):
        """Start the background polling thread."""
        self._running = True
        self._thread = threading.Thread(target=self._poll_loop)
        self._thread.daemon = True
        self._thread.start()
    
    def stop(self):
        """Stop the polling thread."""
        self._running = False
        if self._thread:
            self._thread.join()
    
    def _poll_loop(self):
        """Main polling loop."""
        while self._running:
            try:
                current_block = self.w3.eth.block_number
                confirmation_block = current_block - self.CONFIRMATION_BLOCKS
                
                if confirmation_block > self.last_synced_block:
                    self._process_blocks(
                        self.last_synced_block + 1,
                        confirmation_block
                    )
                    self.last_synced_block = confirmation_block
                    
            except Exception as e:
                logger.error(f"Event polling error: {e}")
            
            time.sleep(self.POLL_INTERVAL)
    
    def _process_blocks(self, from_block: int, to_block: int):
        """Process events from a block range."""
        for contract_name in self.contracts.CONTRACTS.keys():
            contract = self.contracts.get_contract(contract_name)
            
            # Get all events from this contract
            events = contract.events.create_filter(
                fromBlock=from_block,
                toBlock=to_block
            ).get_all_entries()
            
            for event in events:
                self._handle_event(event)
    
    def _handle_event(self, event):
        """Route event to appropriate handler."""
        event_signature = f"{event.address}.{event.event}"
        handler = self.handlers.get(event_signature)
        
        if handler:
            handler(event)
        else:
            # Default handler: store in database
            self._default_event_handler(event)
    
    def _default_event_handler(self, event):
        """Store unhandled events in Django database."""
        from supplychain.models import BlockchainEvent
        
        BlockchainEvent.objects.create(
            tx_hash=event.transactionHash.hex(),
            block_number=event.blockNumber,
            contract_address=event.address,
            event_name=event.event,
            event_data=event.args,
            processed=False
        )
```

### 5.3 Django Model Extensions

```python
# supplychain/models.py (Blockchain Extensions)

from django.db import models

class BlockchainEvent(models.Model):
    """Raw blockchain events pending processing."""
    tx_hash = models.CharField(max_length=66)
    block_number = models.PositiveIntegerField()
    contract_address = models.CharField(max_length=42)
    event_name = models.CharField(max_length=100)
    event_data = models.JSONField()
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['block_number']),
            models.Index(fields=['processed']),
            models.Index(fields=['contract_address', 'event_name']),
        ]

class BlockchainAnchoredRecord(models.Model):
    """Links Django records to blockchain state."""
    django_model = models.CharField(max_length=100)  # 'CropBatch', 'TransportRequest'
    django_id = models.PositiveIntegerField()
    contract_name = models.CharField(max_length=50)
    on_chain_id = models.CharField(max_length=100)  # batchId, transportId
    tx_hash = models.CharField(max_length=66)
    anchored_at = models.DateTimeField(auto_now_add=True)
    anchor_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('CONFIRMED', 'Confirmed'),
            ('FAILED', 'Failed'),
        ],
        default='PENDING'
    )
    
    class Meta:
        unique_together = [('django_model', 'django_id')]

class WalletConnection(models.Model):
    """User wallet connections."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet_connections'
    )
    wallet_address = models.CharField(max_length=42, unique=True)
    chain_id = models.PositiveIntegerField(default=137)  # Polygon
    connected_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    nonce = models.CharField(max_length=100)  # For SIWE (Sign-In with Ethereum)
    
    class Meta:
        indexes = [
            models.Index(fields=['wallet_address']),
            models.Index(fields=['user', 'is_active']),
        ]
```

### 5.4 API Integration Endpoints

```python
# supplychain/web3_views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class Web3ConnectionViewSet(viewsets.ViewSet):
    """API endpoints for Web3 wallet integration."""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def connect_wallet(self, request):
        """
        Connect a wallet address to the authenticated user.
        Requires signature verification (SIWE).
        """
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')
        
        # Verify signature
        if not self._verify_signature(wallet_address, message, signature):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update connection
        WalletConnection.objects.update_or_create(
            wallet_address=wallet_address.lower(),
            defaults={
                'user': request.user,
                'chain_id': request.data.get('chain_id', 137),
                'is_active': True
            }
        )
        
        return Response({'status': 'Wallet connected'})
    
    @action(detail=False, methods=['get'])
    def get_nonce(self, request):
        """Get nonce for SIWE authentication."""
        wallet = request.query_params.get('wallet')
        nonce = self._generate_nonce()
        # Store nonce temporarily (cache or DB)
        return Response({'nonce': nonce})
    
    @action(detail=False, methods=['get'])
    def connection_status(self, request):
        """Check if user has connected wallet."""
        connections = WalletConnection.objects.filter(
            user=request.user,
            is_active=True
        )
        return Response({
            'has_wallet': connections.exists(),
            'wallets': [
                {
                    'address': c.wallet_address,
                    'chain_id': c.chain_id,
                    'connected_at': c.connected_at
                }
                for c in connections
            ]
        })

class BlockchainBatchViewSet(viewsets.ViewSet):
    """API for blockchain-anchored batch operations."""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def anchor_to_chain(self, request, pk=None):
        """
        Anchor an existing batch to the blockchain.
        Creates token and records initial state.
        """
        batch = CropBatch.objects.get(pk=pk)
        
        # Verify ownership
        if batch.farmer.user != request.user:
            return Response(
                {'error': 'Not batch owner'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get user's wallet
        wallet = WalletConnection.objects.get(
            user=request.user,
            is_active=True
        )
        
        # Prepare transaction
        tx_service = TransactionService()
        result = tx_service.build_and_send(
            contract_name='AgriToken',
            function_name='mintBatch',
            args=(
                wallet.wallet_address,
                int(batch.quantity),
                batch.crop_type,
                f"ipfs://{batch.ipfs_hash}",  # Off-chain metadata
                b''  # Additional data
            ),
            from_address=wallet.wallet_address,
            # Private key from secure key management
        )
        
        if result.success:
            # Update database with tx hash
            BlockchainAnchoredRecord.objects.create(
                django_model='CropBatch',
                django_id=batch.id,
                contract_name='AgriToken',
                on_chain_id=result.receipt['tokenId'],
                tx_hash=result.tx_hash,
                anchor_status='CONFIRMED'
            )
            
            return Response({
                'tx_hash': result.tx_hash,
                'block_number': result.block_number,
                'gas_used': result.gas_used
            })
        else:
            return Response(
                {'error': result.error},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def verify_on_chain(self, request, pk=None):
        """
        Verify batch state matches on-chain records.
        """
        batch = CropBatch.objects.get(pk=pk)
        
        # Get anchor record
        anchor = BlockchainAnchoredRecord.objects.filter(
            django_model='CropBatch',
            django_id=batch.id,
            anchor_status='CONFIRMED'
        ).first()
        
        if not anchor:
            return Response({'verified': False, 'reason': 'Not anchored'})
        
        # Query on-chain state
        contracts = ContractManager()
        agri_token = contracts.get_contract('AgriToken')
        
        on_chain_owner = agri_token.functions.getCurrentOwner(
            int(anchor.on_chain_id)
        ).call()
        
        # Compare with database
        db_owner_wallet = WalletConnection.objects.filter(
            user=batch.current_owner
        ).first()
        
        verified = (
            on_chain_owner.lower() == db_owner_wallet.wallet_address.lower()
        ) if db_owner_wallet else False
        
        return Response({
            'verified': verified,
            'on_chain_owner': on_chain_owner,
            'batch_id': anchor.on_chain_id,
            'tx_hash': anchor.tx_hash
        })
```

### 5.5 Frontend Web3 Integration

```javascript
// src/services/web3Service.js

import { ethers } from 'ethers';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    
    const address = await this.signer.getAddress();
    const chainId = await this.signer.getChainId();
    
    // Verify we're on correct network
    if (chainId !== 137) {  // Polygon mainnet
      await this.switchNetwork();
    }
    
    return { address, chainId };
  }

  async signInWithEthereum(nonce) {
    const address = await this.signer.getAddress();
    const message = `AgriChain Login\nAddress: ${address}\nNonce: ${nonce}`;
    
    const signature = await this.signer.signMessage(message);
    
    return {
      message,
      signature,
      address
    };
  }

  async loadContracts() {
    const deployments = await fetch('/api/contracts/deployments').then(r => r.json());
    
    this.contracts.agriToken = new ethers.Contract(
      deployments.AgriToken.address,
      deployments.AgriToken.abi,
      this.signer
    );
    
    this.contracts.supplyChain = new ethers.Contract(
      deployments.SupplyChainMaster.address,
      deployments.SupplyChainMaster.abi,
      this.signer
    );
    
    return this.contracts;
  }

  async mintBatch(batchData) {
    const tx = await this.contracts.agriToken.mintBatch(
      batchData.farmerAddress,
      ethers.utils.parseUnits(batchData.quantity.toString(), 0),
      batchData.cropType,
      batchData.metadataURI,
      '0x'
    );
    
    const receipt = await tx.wait();
    
    // Parse event for tokenId
    const event = receipt.events.find(e => e.event === 'BatchMinted');
    
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      batchId: event.args.batchId.toString()
    };
  }

  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],  // 137 in hex
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com']
          }]
        });
      }
    }
  }

  async listenToEvents(eventName, callback) {
    this.contracts.agriToken.on(eventName, (...args) => {
      const event = args[args.length - 1];
      callback({
        event: eventName,
        args: args.slice(0, -1),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });
  }
}

export default new Web3Service();
```

### 5.6 Meta-Transaction Support

For stakeholders without native tokens (gasless transactions):

```solidity
// contracts/MetaTransactionProcessor.sol

abstract contract MetaTransactionProcessor {
    using ECDSA for bytes32;
    
    mapping(address => uint256) public nonces;
    
    function executeMetaTransaction(
        address userAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public payable returns (bytes memory) {
        
        // Verify signature
        bytes32 hash = keccak256(abi.encodePacked(
            userAddress,
            nonces[userAddress],
            address(this),
            functionSignature
        ));
        
        require(
            userAddress == hash.toEthSignedMessageHash().recover(sigV, sigR, sigS),
            "Invalid signature"
        );
        
        nonces[userAddress]++;
        
        // Execute function
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, userAddress)
        );
        
        require(success, "Meta-transaction failed");
        return returnData;
    }
}
```

---

## 6. Data Migration Strategy

### 6.1 Migration Approach

**Phased Migration**:

1. **Phase 1: Forward-Only** (New batches only)
   - New batches created after go-live are anchored
   - Existing batches remain off-chain
   - Minimal risk, immediate value

2. **Phase 2: Selective Backfill** (High-value batches)
   - Manually select important batches for migration
   - Farmer-initiated migration with small gas subsidy
   - Quality control before bulk migration

3. **Phase 3: Complete Migration** (All active batches)
   - Automated migration of batches in active workflows
   - Batch migration tool with progress tracking
   - Archive old completed batches

### 6.2 Migration Data Mapping

| Django Model | Contract | Mapping Logic |
|--------------|----------|---------------|
| `CropBatch` | `AgriToken` | One batch = one token ID |
| `TransportRequest` | `SupplyChainMaster` | Create transport record |
| `BatchEvent` | `EventAnchor` | Anchor each event sequentially |
| `StakeholderProfile` | `StakeholderRegistry` | Link wallet to role |

### 6.3 Migration Script Structure

```python
# management/commands/migrate_to_blockchain.py

from django.core.management.base import BaseCommand
from supplychain.models import CropBatch
from supplychain.web3_services import TransactionService, ContractManager

class Command(BaseCommand):
    help = 'Migrate existing batches to blockchain'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-id',
            type=int,
            help='Migrate specific batch'
        )
        parser.add_argument(
            '--status',
            type=str,
            help='Migrate batches with specific status'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate without sending transactions'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Maximum batches to migrate'
        )
    
    def handle(self, *args, **options):
        # Build queryset
        queryset = CropBatch.objects.filter(
            blockchainanchor__isnull=True
        )
        
        if options['batch_id']:
            queryset = queryset.filter(id=options['batch_id'])
        if options['status']:
            queryset = queryset.filter(status=options['status'])
        
        queryset = queryset[:options['limit']]
        
        # Initialize services
        tx_service = TransactionService()
        
        success_count = 0
        fail_count = 0
        
        for batch in queryset:
            try:
                self.migrate_batch(batch, tx_service, options['dry_run'])
                success_count += 1
            except Exception as e:
                self.stderr.write(f"Failed batch {batch.id}: {e}")
                fail_count += 1
        
        self.stdout.write(
            f"Migration complete: {success_count} succeeded, {fail_count} failed"
        )
    
    def migrate_batch(self, batch, tx_service, dry_run):
        """Migrate a single batch to blockchain."""
        # Prepare data
        farmer_wallet = batch.farmer.wallet_connections.filter(
            is_active=True
        ).first()
        
        if not farmer_wallet:
            raise ValueError(f"Farmer {batch.farmer.id} has no connected wallet")
        
        args = (
            farmer_wallet.wallet_address,
            int(batch.quantity),
            batch.crop_type,
            self.generate_metadata_uri(batch),
            b''
        )
        
        if dry_run:
            self.stdout.write(f"[DRY RUN] Would migrate batch {batch.id}")
            return
        
        # Send transaction
        result = tx_service.build_and_send(
            contract_name='AgriToken',
            function_name='mintBatch',
            args=args,
            from_address=farmer_wallet.wallet_address,
            # Private key from secure storage
        )
        
        if not result.success:
            raise Exception(result.error)
        
        # Create anchor record
        BlockchainAnchoredRecord.objects.create(
            django_model='CropBatch',
            django_id=batch.id,
            contract_name='AgriToken',
            on_chain_id=self.extract_token_id(result.receipt),
            tx_hash=result.tx_hash,
            anchor_status='CONFIRMED'
        )
        
        self.stdout.write(f"Migrated batch {batch.id} -> tx {result.tx_hash}")
```

---

## 7. Security Architecture

### 7.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| Private key compromise | Critical | Low | Hardware wallets, multi-sig |
| Smart contract bug | Critical | Medium | Audits, formal verification, upgrades |
| Front-running | Medium | High | Commit-reveal pattern, meta-transactions |
| Replay attacks | High | Low | Chain ID, nonces, EIP-712 |
| Oracle manipulation | High | Medium | Multiple data sources, time delays |
| Gas price attacks | Medium | Medium | Gas limits, circuit breakers |

### 7.2 Security Controls

**Smart Contract Level**:
- OpenZeppelin libraries for standard patterns
- ReentrancyGuard on all payment functions
- Pausable for emergency stops
- AccessControl for role management
- UUPSUpgradeable for bug fixes

**Application Level**:
- Input validation on all Web3 calls
- Rate limiting on transaction submissions
- Transaction simulation before execution
- Multi-signature for admin operations

**Infrastructure Level**:
- Separate hot/cold wallets
- Hardware Security Modules (HSM) for keys
- Network segmentation
- Regular security audits

### 7.3 Key Management Strategy

```
Key Tiers:
├── Tier 1: Admin Keys (Multi-sig, 3-of-5)
│   └── Contract upgrades, emergency pause
├── Tier 2: Relayer Keys (Hot wallet)
│   └── Meta-transaction processing
├── Tier 3: User Keys (External)
│   └── Farmer/Distributor/Retailer wallets
└── Tier 4: Service Keys (AWS KMS)
    └── Automated operations, monitoring
```

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Foundation (Weeks 1-4)

**Deliverables**:
- Smart contract development (Solidity)
- Local testing environment (Hardhat)
- Contract unit tests (100% coverage)
- Basic Web3 bridge service in Django

**Milestones**:
- [ ] AgriToken contract deployed locally
- [ ] SupplyChainMaster contract deployed locally
- [ ] Django can read contract state
- [ ] Wallet connection API working

### 8.2 Phase 2: Integration (Weeks 5-8)

**Deliverables**:
- Frontend wallet integration (MetaMask)
- Batch creation on-chain
- Event synchronization
- Stakeholder registry

**Milestones**:
- [ ] Farmers can create batches on-chain
- [ ] Events sync to Django database
- [ ] Wallet connection in React
- [ ] Testnet deployment (Sepolia/Polygon Mumbai)

### 8.3 Phase 3: Workflow (Weeks 9-12)

**Deliverables**:
- Full supply chain workflow on-chain
- Transport tracking
- Ownership transfers
- Inspection anchoring

**Milestones**:
- [ ] Complete lifecycle from CREATED to SOLD
- [ ] Transport events recorded
- [ ] Ownership changes tracked
- [ ] Consumer verification working

### 8.4 Phase 4: Production (Weeks 13-16)

**Deliverables**:
- Security audit
- Mainnet deployment
- Data migration
- Monitoring and alerting

**Milestones**:
- [ ] Security audit passed
- [ ] Mainnet deployment complete
- [ ] 50% of new batches on-chain
- [ ] Full monitoring dashboard

### 8.5 Gantt Chart

```
Week:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
       ├───── Phase 1: Foundation ─────┤
                     ├────── Phase 2: Integration ──────┤
                                        ├───── Phase 3: Workflow ─────┤
                                                                    ├─ Phase 4 ─┤
Smart Contracts     ████████████████████
Web3 Bridge              ████████████████████████
Frontend Integration          ████████████████████████
Event Sync                       ████████████████████████████
Testing/Audit                                        ████████████████████
Mainnet Deploy                                                        ████████
```

---

## 9. Cost Analysis

### 9.1 Gas Cost Estimates (Polygon)

| Operation | Gas Units | MATIC Cost* | USD Cost* |
|-----------|-----------|-------------|-----------|
| Mint Batch | 150,000 | 0.0015 | $0.0015 |
| Request Transport | 80,000 | 0.0008 | $0.0008 |
| Accept Transport | 60,000 | 0.0006 | $0.0006 |
| Confirm Delivery | 100,000 | 0.0010 | $0.0010 |
| Store Batch | 70,000 | 0.0007 | $0.0007 |
| Create Listing | 90,000 | 0.0009 | $0.0009 |
| Mark Sold | 120,000 | 0.0012 | $0.0012 |
| Suspend Batch | 50,000 | 0.0005 | $0.0005 |

*At 10 gwei gas price, MATIC = $1.00

### 9.2 Monthly Operating Costs

| Cost Item | Estimation |
|-----------|------------|
| New Batches (100/month) | $0.15 |
| Transport Events (200/month) | $0.50 |
| Sales (50/month) | $0.10 |
| RPC Node (Alchemy/Infura) | $50-100 |
| Monitoring | $20 |
| **Total Monthly** | **$70-120** |

### 9.3 One-Time Costs

| Item | Cost |
|------|------|
| Security Audit | $10,000-25,000 |
| Development Time | $30,000-50,000 |
| Infrastructure Setup | $2,000 |
| **Total One-Time** | **$42,000-77,000** |

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Smart contract vulnerability | Medium | Critical | Multiple audits, bug bounties, upgradeability |
| L2 network downtime | Low | High | Fallback to Web2, multi-L2 strategy |
| Gas price spikes | Medium | Medium | Meta-transactions, gas price caps |
| Key management failure | Low | Critical | HSM, multi-sig, key rotation |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | Education, incentives, simplified UX |
| Regulatory changes | Low | Medium | Compliance monitoring, modular design |
| Competitor moves | High | Medium | First-mover advantage, continuous improvement |

### 10.3 Mitigation Strategies

**Technical**:
- Gradual rollout with feature flags
- Comprehensive test coverage
- Real-time monitoring and alerting
- Automated circuit breakers

**Operational**:
- 24/7 on-call rotation
- Regular security audits
- Incident response plan
- User education program

---

## 11. Appendices

### Appendix A: Contract Deployment Scripts

```javascript
// scripts/deploy.js (Hardhat)

const hre = require("hardhat");

async function main() {
  // Deploy registry first (others depend on it)
  const StakeholderRegistry = await hre.ethers.getContractFactory("StakeholderRegistry");
  const registry = await StakeholderRegistry.deploy();
  await registry.deployed();
  console.log("StakeholderRegistry deployed to:", registry.address);

  // Deploy AgriToken
  const AgriToken = await hre.ethers.getContractFactory("AgriToken");
  const agriToken = await AgriToken.deploy();
  await agriToken.deployed();
  console.log("AgriToken deployed to:", agriToken.address);

  // Deploy SupplyChainMaster
  const SupplyChainMaster = await hre.ethers.getContractFactory("SupplyChainMaster");
  const supplyChain = await SupplyChainMaster.deploy(
    agriToken.address,
    registry.address
  );
  await supplyChain.deployed();
  console.log("SupplyChainMaster deployed to:", supplyChain.address);

  // Deploy PaymentEscrow
  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const escrow = await PaymentEscrow.deploy();
  await escrow.deployed();
  console.log("PaymentEscrow deployed to:", escrow.address);

  // Deploy EventAnchor
  const EventAnchor = await hre.ethers.getContractFactory("EventAnchor");
  const eventAnchor = await EventAnchor.deploy();
  await eventAnchor.deployed();
  console.log("EventAnchor deployed to:", eventAnchor.address);

  // Set up contract relationships
  await agriToken.setSupplyChainContract(supplyChain.address);
  await supplyChain.setPaymentEscrow(escrow.address);
  await supplyChain.setEventAnchor(eventAnchor.address);

  // Save deployment artifacts
  const deployment = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    contracts: {
      StakeholderRegistry: { address: registry.address },
      AgriToken: { address: agriToken.address },
      SupplyChainMaster: { address: supplyChain.address },
      PaymentEscrow: { address: escrow.address },
      EventAnchor: { address: eventAnchor.address }
    },
    deployedAt: new Date().toISOString()
  };

  require('fs').writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deployment, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Appendix B: Testing Strategy

**Unit Tests** (Solidity - Foundry):
```solidity
// test/AgriToken.t.sol

contract AgriTokenTest is Test {
    AgriToken token;
    address farmer = address(1);
    
    function setUp() public {
        token = new AgriToken();
        token.grantRole(token.MINTER_ROLE(), address(this));
    }
    
    function test_MintBatch() public {
        uint256 batchId = token.mintBatch(
            farmer,
            1000,
            "Wheat",
            "ipfs://Qm...",
            ""
        );
        
        assertEq(token.balanceOf(farmer, batchId), 1000);
        assertEq(token.getCurrentOwner(batchId), farmer);
    }
    
    function test_SplitBatch() public {
        uint256 parentId = token.mintBatch(farmer, 1000, "Wheat", "ipfs://Qm...", "");
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 400;
        quantities[1] = 600;
        
        address[] memory recipients = new address[](2);
        recipients[0] = address(2);
        recipients[1] = address(3);
        
        uint256[] memory childIds = token.splitBatch(parentId, quantities, recipients, new string[](2));
        
        assertEq(childIds.length, 2);
        assertEq(token.balanceOf(address(2), childIds[0]), 400);
        assertEq(token.balanceOf(address(3), childIds[1]), 600);
    }
}
```

**Integration Tests** (Python):
```python
# tests/test_web3_integration.py

import pytest
from django.test import TestCase
from supplychain.web3_services import TransactionService, ContractManager

class TestWeb3Integration(TestCase):
    def setUp(self):
        self.tx_service = TransactionService()
        self.contracts = ContractManager()
    
    def test_batch_creation_on_chain(self):
        """Test creating a batch on the blockchain."""
        result = self.tx_service.build_and_send(
            contract_name='AgriToken',
            function_name='mintBatch',
            args=(
                '0xFarmerAddress...',
                1000,
                'Wheat',
                'ipfs://Qm...',
                b''
            ),
            from_address='0xFarmerAddress...',
            private_key='test-key'
        )
        
        self.assertTrue(result.success)
        self.assertIsNotNone(result.tx_hash)
```

### Appendix C: Configuration Reference

**Django Settings**:
```python
# settings.py (Blockchain Configuration)

# Web3 Configuration
WEB3_RPC_URLS = [
    'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon',
]
WEB3_CHAIN_ID = 137
WEB3_NETWORK = 'polygon'

# Contract Addresses (loaded from environment or deployment file)
CONTRACT_ADDRESSES = {
    'AgriToken': os.getenv('AGRI_TOKEN_ADDRESS'),
    'SupplyChainMaster': os.getenv('SUPPLY_CHAIN_ADDRESS'),
    'StakeholderRegistry': os.getenv('REGISTRY_ADDRESS'),
}

# Gas Settings
GAS_PRICE_GWEI = int(os.getenv('GAS_PRICE_GWEI', 30))
MAX_GAS_PRICE_GWEI = int(os.getenv('MAX_GAS_PRICE_GWEI', 100))

# Meta-transaction Settings
METATX_RELAYER_ADDRESS = os.getenv('METATX_RELAYER_ADDRESS')
METATX_RELAYER_KEY = os.getenv('METATX_RELAYER_KEY')

# IPFS Configuration
IPFS_API_URL = os.getenv('IPFS_API_URL', 'https://ipfs.infura.io:5001')
IPFS_PROJECT_ID = os.getenv('IPFS_PROJECT_ID')
IPFS_PROJECT_SECRET = os.getenv('IPFS_PROJECT_SECRET')

# Feature Flags
ENABLE_BLOCKCHAIN = os.getenv('ENABLE_BLOCKCHAIN', 'False').lower() == 'true'
REQUIRE_WALLET_CONNECTION = os.getenv('REQUIRE_WALLET', 'False').lower() == 'true'
```

### Appendix D: Monitoring & Alerting

**Key Metrics**:

| Metric | Alert Threshold |
|--------|----------------|
| Failed Transactions | > 5% in 1 hour |
| Gas Price | > 100 gwei for 10 min |
| Event Sync Lag | > 10 blocks behind |
| Wallet Connection Errors | > 10 in 1 hour |
| Contract Balance | < 1 MATIC |

**Prometheus Metrics**:
```python
# monitoring/metrics.py

from prometheus_client import Counter, Histogram, Gauge

# Transaction metrics
blockchain_transactions_total = Counter(
    'blockchain_transactions_total',
    'Total blockchain transactions',
    ['contract', 'function', 'status']
)

blockchain_gas_used = Histogram(
    'blockchain_gas_used',
    'Gas used per transaction',
    ['contract', 'function']
)

# Sync metrics
blockchain_sync_lag = Gauge(
    'blockchain_sync_lag_blocks',
    'Number of blocks behind current chain'
)

# Wallet metrics
wallet_connections_total = Counter(
    'wallet_connections_total',
    'Total wallet connections',
    ['role']
)
```

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Created | February 2026 |
| Author | AgriChain Technical Team |
| Status | Draft |
| Target Platform | Ethereum L2 (Polygon/Arbitrum) |
| Review Cycle | Quarterly |

---

**End of Document**
