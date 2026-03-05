"""
Blockchain Service Module

Provides interface to the HashAnchor smart contract on Polygon Amoy testnet.
Handles all blockchain operations including anchoring batch hashes,
retrieving anchor records, and verifying data integrity.
"""

import logging
import os
from typing import Optional, Dict, Any, Tuple
from decimal import Decimal

from web3 import Web3
from eth_account import Account
from eth_abi import encode
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Contract ABI - HashAnchor.sol
# This is extracted from the TypeChain generated files
HASH_ANCHOR_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "admin", "type": "address"},
            {"internalType": "address", "name": "initialAnchorer", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AccessControlBadConfirmation",
        "type": "error"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"},
            {"internalType": "bytes32", "name": "neededRole", "type": "bytes32"}
        ],
        "name": "AccessControlUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "batchId", "type": "bytes32"},
            {"indexed": True, "internalType": "bytes32", "name": "snapshotHash", "type": "bytes32"},
            {"indexed": True, "internalType": "uint256", "name": "recordIndex", "type": "uint256"},
            {"indexed": False, "internalType": "uint64", "name": "anchoredAt", "type": "uint64"},
            {"indexed": False, "internalType": "address", "name": "anchoredBy", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "context", "type": "string"}
        ],
        "name": "HashAnchored",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ANCHORER_ROLE",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "batchId", "type": "bytes32"},
            {"internalType": "bytes32", "name": "snapshotHash", "type": "bytes32"},
            {"internalType": "string", "name": "context", "type": "string"}
        ],
        "name": "anchorHash",
        "outputs": [{"internalType": "uint256", "name": "recordIndex", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "batchId", "type": "bytes32"},
            {"internalType": "uint256", "name": "index", "type": "uint256"}
        ],
        "name": "getAnchor",
        "outputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "snapshotHash", "type": "bytes32"},
                    {"internalType": "uint64", "name": "anchoredAt", "type": "uint64"},
                    {"internalType": "string", "name": "context", "type": "string"},
                    {"internalType": "address", "name": "anchoredBy", "type": "address"}
                ],
                "internalType": "struct HashAnchor.AnchorRecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "batchId", "type": "bytes32"}],
        "name": "getAnchorCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "batchId", "type": "bytes32"}],
        "name": "getLatestAnchor",
        "outputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "snapshotHash", "type": "bytes32"},
                    {"internalType": "uint64", "name": "anchoredAt", "type": "uint64"},
                    {"internalType": "string", "name": "context", "type": "string"},
                    {"internalType": "address", "name": "anchoredBy", "type": "address"}
                ],
                "internalType": "struct HashAnchor.AnchorRecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
        "name": "getRoleAdmin",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "role", "type": "bytes32"},
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "role", "type": "bytes32"},
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "hasRole",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "role", "type": "bytes32"},
            {"internalType": "address", "name": "callerConfirmation", "type": "address"}
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "role", "type": "bytes32"},
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
        "name": "supportsInterface",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]


class BlockchainService:
    """
    Service for interacting with the HashAnchor smart contract.
    
    Handles all blockchain operations including:
    - Connecting to Polygon Amoy network
    - Anchoring batch hashes
    - Retrieving anchor records
    - Verifying data integrity
    
    Environment Variables Required:
        - POLYGON_AMOY_RPC_URL: RPC endpoint for Polygon Amoy
        - HASH_ANCHOR_CONTRACT_ADDRESS: Deployed contract address
        - ANCHORER_PRIVATE_KEY: Private key for transaction signing
    """
    
    def __init__(self):
        """Initialize blockchain connection and contract instance."""
        self.w3: Optional[Web3] = None
        self.contract = None
        self.account = None
        self._connect()
    
    def _connect(self) -> None:
        """Establish connection to Polygon Amoy network."""
        try:
            # Get configuration from environment
            rpc_url = os.getenv('POLYGON_AMOY_RPC_URL')
            contract_address = os.getenv('HASH_ANCHOR_CONTRACT_ADDRESS')
            private_key = os.getenv('ANCHORER_PRIVATE_KEY')
            
            if not rpc_url:
                raise ValueError("POLYGON_AMOY_RPC_URL not set in environment")
            if not contract_address:
                raise ValueError("HASH_ANCHOR_CONTRACT_ADDRESS not set in environment")
            if not private_key:
                raise ValueError("ANCHORER_PRIVATE_KEY not set in environment")
            
            # Initialize Web3 connection
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            # Verify connection
            if not self.w3.is_connected():
                raise ConnectionError(f"Failed to connect to {rpc_url}")
            
            logger.info(f"Connected to Polygon Amoy (Chain ID: {self.w3.eth.chain_id})")
            
            # Initialize account from private key
            self.account = Account.from_key(private_key)
            logger.info(f"Account loaded: {self.account.address}")
            
            # Initialize contract
            checksum_address = Web3.to_checksum_address(contract_address)
            self.contract = self.w3.eth.contract(
                address=checksum_address,
                abi=HASH_ANCHOR_ABI
            )
            logger.info(f"Contract initialized at {checksum_address}")
            
        except Exception as e:
            logger.error(f"Blockchain connection failed: {e}")
            raise
    
    def _batch_id_to_bytes32(self, batch_id: str) -> bytes:
        """
        Convert batch ID string to bytes32 format.
        
        Uses keccak256 hash to ensure consistent 32-byte output.
        """
        return Web3.keccak(text=batch_id)
    
    def _ensure_bytes32(self, data: bytes) -> bytes:
        """Ensure data is exactly 32 bytes."""
        if len(data) == 32:
            return data
        elif len(data) < 32:
            # Pad with zeros
            return data.ljust(32, b'\x00')
        else:
            # Truncate
            return data[:32]
    
    def anchor_batch_hash(
        self, 
        batch_id: str, 
        snapshot_hash: bytes, 
        context: str
    ) -> Dict[str, Any]:
        """
        Anchor a batch hash to the blockchain.
        
        Args:
            batch_id: Unique batch identifier (e.g., "BATCH-20240305-ABC12345")
            snapshot_hash: 32-byte SHA256 hash of batch data
            context: Event context (e.g., "CREATED", "DELIVERED_TO_DISTRIBUTOR")
            
        Returns:
            dict: Transaction receipt with blockchain data
            {
                "transaction_hash": str,
                "block_number": int,
                "gas_used": int,
                "record_index": int,
                "status": bool
            }
            
        Raises:
            Exception: If transaction fails
        """
        try:
            # Convert inputs to blockchain format
            batch_id_bytes = self._batch_id_to_bytes32(batch_id)
            hash_bytes = self._ensure_bytes32(snapshot_hash)
            
            # Build transaction
            tx = self.contract.functions.anchorHash(
                batch_id_bytes,
                hash_bytes,
                context
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 200000,  # Gas limit
                'gasPrice': self.w3.eth.gas_price,
                'chainId': 80002  # Polygon Amoy
            })
            
            logger.info(f"Anchoring batch {batch_id} with context '{context}'")
            
            # Sign transaction
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.account.key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] != 1:
                raise Exception(f"Transaction failed: {receipt}")
            
            # Get record index from event logs
            record_index = self._extract_record_index_from_logs(receipt['logs'])
            
            result = {
                "transaction_hash": receipt['transactionHash'].hex(),
                "block_number": receipt['blockNumber'],
                "gas_used": receipt['gasUsed'],
                "record_index": record_index,
                "status": True
            }
            
            logger.info(f"Anchor successful: block {receipt['blockNumber']}, index {record_index}")
            return result
            
        except Exception as e:
            logger.error(f"Anchor failed for batch {batch_id}: {e}")
            raise
    
    def get_latest_anchor(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve the most recent anchor for a batch.
        
        Args:
            batch_id: Unique batch identifier
            
        Returns:
            dict: Anchor record data or None if no anchors exist
            {
                "snapshot_hash": bytes,
                "anchored_at": int (timestamp),
                "context": str,
                "anchored_by": str (address)
            }
        """
        try:
            batch_id_bytes = self._batch_id_to_bytes32(batch_id)
            
            # Call contract function
            result = self.contract.functions.getLatestAnchor(batch_id_bytes).call()
            
            return {
                "snapshot_hash": result[0],
                "anchored_at": result[1],
                "context": result[2],
                "anchored_by": result[3]
            }
            
        except Exception as e:
            # No anchors exist for this batch
            logger.warning(f"No anchors found for batch {batch_id}: {e}")
            return None
    
    def get_anchor_count(self, batch_id: str) -> int:
        """
        Get the number of anchors for a batch.
        
        Args:
            batch_id: Unique batch identifier
            
        Returns:
            int: Number of anchor records
        """
        try:
            batch_id_bytes = self._batch_id_to_bytes32(batch_id)
            count = self.contract.functions.getAnchorCount(batch_id_bytes).call()
            return count
        except Exception as e:
            logger.error(f"Failed to get anchor count for {batch_id}: {e}")
            return 0
    
    def get_anchor_by_index(self, batch_id: str, index: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific anchor by its index.
        
        Args:
            batch_id: Unique batch identifier
            index: Record index (0-based)
            
        Returns:
            dict: Anchor record or None if index out of bounds
        """
        try:
            batch_id_bytes = self._batch_id_to_bytes32(batch_id)
            result = self.contract.functions.getAnchor(batch_id_bytes, index).call()
            
            return {
                "snapshot_hash": result[0],
                "anchored_at": result[1],
                "context": result[2],
                "anchored_by": result[3]
            }
        except Exception as e:
            logger.error(f"Failed to get anchor {index} for {batch_id}: {e}")
            return None
    
    def verify_batch_integrity(self, batch) -> Dict[str, Any]:
        """
        Verify batch data integrity against blockchain record.
        
        This method compares the current database hash with the
        hash stored on the blockchain.
        
        Args:
            batch: CropBatch model instance
            
        Returns:
            dict: Verification result
            {
                "verified": bool,
                "current_hash": str (hex),
                "stored_hash": str (hex),
                "anchored_at": int (timestamp),
                "anchored_by": str (address),
                "message": str
            }
        """
        from .hash_generator import generate_batch_hash
        
        try:
            # Generate current hash from database
            current_hash = generate_batch_hash(batch)
            
            # Get latest blockchain record
            latest_anchor = self.get_latest_anchor(batch.product_batch_id)
            
            if not latest_anchor:
                return {
                    "verified": False,
                    "current_hash": current_hash.hex(),
                    "stored_hash": None,
                    "anchored_at": None,
                    "anchored_by": None,
                    "message": "No blockchain record found for this batch"
                }
            
            stored_hash = latest_anchor["snapshot_hash"]
            
            # Compare hashes
            if current_hash == stored_hash:
                return {
                    "verified": True,
                    "current_hash": current_hash.hex(),
                    "stored_hash": stored_hash.hex(),
                    "anchored_at": latest_anchor["anchored_at"],
                    "anchored_by": latest_anchor["anchored_by"],
                    "message": "Data integrity confirmed - no tampering detected"
                }
            else:
                return {
                    "verified": False,
                    "current_hash": current_hash.hex(),
                    "stored_hash": stored_hash.hex(),
                    "anchored_at": latest_anchor["anchored_at"],
                    "anchored_by": latest_anchor["anchored_by"],
                    "message": "WARNING: Data tampering detected - hashes do not match"
                }
                
        except Exception as e:
            logger.error(f"Verification failed for batch {batch.product_batch_id}: {e}")
            return {
                "verified": False,
                "current_hash": None,
                "stored_hash": None,
                "anchored_at": None,
                "anchored_by": None,
                "message": f"Verification error: {str(e)}"
            }
    
    def _extract_record_index_from_logs(self, logs: list) -> int:
        """
        Extract record index from transaction logs.
        
        The HashAnchored event contains the record index as one of its topics.
        """
        try:
            # Decode the HashAnchored event
            for log in logs:
                if len(log['topics']) > 0:
                    # The record index is the 3rd indexed parameter (topic 3)
                    # It's encoded as uint256 in the topics
                    if len(log['topics']) >= 3:
                        # Decode uint256 from topic
                        index_hex = log['topics'][2].hex()
                        index = int(index_hex, 16)
                        return index
            return -1
        except Exception as e:
            logger.warning(f"Could not extract record index from logs: {e}")
            return -1
    
    def get_balance(self) -> Decimal:
        """Get the balance of the anchorer account in MATIC."""
        if not self.account:
            return Decimal('0')
        
        balance_wei = self.w3.eth.get_balance(self.account.address)
        return Decimal(self.w3.from_wei(balance_wei, 'ether'))
    
    def get_gas_price(self) -> int:
        """Get current gas price in wei."""
        return self.w3.eth.gas_price
    
    def is_healthy(self) -> bool:
        """Check if blockchain connection is healthy."""
        try:
            return self.w3.is_connected() and self.contract is not None
        except:
            return False


# =============================================================================
# Singleton Instance
# =============================================================================

# Create a singleton instance for application-wide use
# This avoids creating multiple connections
_blockchain_service = None

def get_blockchain_service() -> BlockchainService:
    """
    Get or create the blockchain service singleton.
    
    Returns:
        BlockchainService: Singleton instance
    """
    global _blockchain_service
    if _blockchain_service is None:
        _blockchain_service = BlockchainService()
    return _blockchain_service


# =============================================================================
# TEST SNIPPET
# =============================================================================

if __name__ == "__main__":
    """
    Test the blockchain service functionality.
    
    Run with: python supplychain/blockchain_service.py
    
    Requires:
        - .env file with blockchain configuration
        - Deployed HashAnchor contract
        - Anchorer account with test MATIC
    """
    import sys
    
    print("=" * 60)
    print("Blockchain Service Test")
    print("=" * 60)
    
    # Check environment
    required_vars = [
        'POLYGON_AMOY_RPC_URL',
        'HASH_ANCHOR_CONTRACT_ADDRESS',
        'ANCHORER_PRIVATE_KEY'
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        print(f"\n❌ Missing environment variables: {', '.join(missing)}")
        print("Please set these in your .env file")
        sys.exit(1)
    
    try:
        # Initialize service
        print("\n🔌 Connecting to blockchain...")
        service = BlockchainService()
        print(f"   ✓ Connected (Chain ID: {service.w3.eth.chain_id})")
        
        # Check account balance
        balance = service.get_balance()
        print(f"   ✓ Account: {service.account.address}")
        print(f"   ✓ Balance: {balance:.6f} MATIC")
        
        if balance == 0:
            print("\n⚠️  Warning: Account has no MATIC for transactions")
            print("   Get test MATIC from: https://faucet.polygon.technology/")
        
        # Check contract
        print("\n📋 Contract Status:")
        print(f"   Address: {service.contract.address}")
        
        # Test with dummy batch
        test_batch_id = "TEST-BATCH-001"
        test_hash = b'\x01' * 32  # Dummy 32-byte hash
        
        print(f"\n🔗 Testing Anchor for {test_batch_id}...")
        
        # Get current anchor count
        count_before = service.get_anchor_count(test_batch_id)
        print(f"   Anchors before: {count_before}")
        
        # Anchor a test hash (only if we have balance)
        if balance > 0:
            try:
                result = service.anchor_batch_hash(
                    test_batch_id,
                    test_hash,
                    "TEST_ANCHOR"
                )
                print(f"   ✓ Anchor successful!")
                print(f"   Transaction: {result['transaction_hash']}")
                print(f"   Block: {result['block_number']}")
                print(f"   Gas Used: {result['gas_used']}")
                print(f"   Record Index: {result['record_index']}")
                
                # Verify count increased
                count_after = service.get_anchor_count(test_batch_id)
                print(f"   Anchors after: {count_after}")
                
                # Retrieve the anchor
                latest = service.get_latest_anchor(test_batch_id)
                print(f"\n📖 Retrieved Latest Anchor:")
                print(f"   Hash: {latest['snapshot_hash'].hex()[:16]}...")
                print(f"   Context: {latest['context']}")
                print(f"   By: {latest['anchored_by'][:10]}...")
                print(f"   At: {latest['anchored_at']}")
                
            except Exception as e:
                print(f"   ⚠️ Anchor test failed: {e}")
        else:
            print("   ⏭️ Skipping anchor test (no balance)")
        
        print("\n" + "=" * 60)
        print("Blockchain Service Test Complete")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
