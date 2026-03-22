"""
Management Command: grant_anchorer_role

Grants the ANCHORER_ROLE on the HashAnchor smart contract to the backend
wallet address configured in ANCHORER_PRIVATE_KEY (.env).

This command must be signed by the deployer/admin wallet, which holds
DEFAULT_ADMIN_ROLE on the contract. You pass the deployer private key as
a CLI argument so it never needs to live in your .env file.

Usage:
    python manage.py grant_anchorer_role --deployer-key 0xYOUR_DEPLOYER_PRIVATE_KEY

After running this once successfully, the backend wallet permanently has
ANCHORER_ROLE and can call anchorHash() without reverting.
"""

import os
from django.core.management.base import BaseCommand, CommandError
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()


class Command(BaseCommand):
    help = (
        "Grant ANCHORER_ROLE on the HashAnchor contract to the backend wallet. "
        "Must be called by the deployer/admin wallet which holds DEFAULT_ADMIN_ROLE."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--deployer-key",
            type=str,
            required=True,
            help="Private key of the deployer/admin wallet (0x-prefixed). "
                 "This wallet must hold DEFAULT_ADMIN_ROLE on the contract.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Simulate the grant without sending a transaction.",
        )

    def handle(self, *args, **options):
        deployer_key = options["deployer_key"]
        dry_run = options["dry_run"]

        # ── Load config from environment ──────────────────────────────────────
        rpc_url = os.getenv("POLYGON_AMOY_RPC_URL")
        contract_address = os.getenv("HASH_ANCHOR_CONTRACT_ADDRESS")
        backend_private_key = os.getenv("ANCHORER_PRIVATE_KEY")

        if not rpc_url:
            raise CommandError("POLYGON_AMOY_RPC_URL is not set in .env")
        if not contract_address:
            raise CommandError("HASH_ANCHOR_CONTRACT_ADDRESS is not set in .env")
        if not backend_private_key:
            raise CommandError("ANCHORER_PRIVATE_KEY is not set in .env")

        # ── Derive addresses ──────────────────────────────────────────────────
        try:
            deployer_account = Account.from_key(deployer_key)
        except Exception as e:
            raise CommandError(f"Invalid deployer private key: {e}")

        try:
            backend_account = Account.from_key(backend_private_key)
        except Exception as e:
            raise CommandError(f"Invalid backend private key in .env: {e}")

        deployer_address = deployer_account.address
        backend_address = backend_account.address

        self.stdout.write(self.style.HTTP_INFO(f"Deployer wallet : {deployer_address}"))
        self.stdout.write(self.style.HTTP_INFO(f"Backend wallet  : {backend_address}"))
        self.stdout.write(self.style.HTTP_INFO(f"Contract        : {contract_address}"))

        # ── Connect to Polygon Amoy ───────────────────────────────────────────
        self.stdout.write("\nConnecting to Polygon Amoy...")
        w3 = Web3(Web3.HTTPProvider(rpc_url))

        if not w3.is_connected():
            raise CommandError(f"Could not connect to RPC: {rpc_url}")

        chain_id = w3.eth.chain_id
        self.stdout.write(self.style.SUCCESS(f"Connected. Chain ID: {chain_id}"))

        # Minimal ABI – only what we need
        abi = [
            {
                "inputs": [],
                "name": "ANCHORER_ROLE",
                "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
                "stateMutability": "view",
                "type": "function",
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "role", "type": "bytes32"},
                    {"internalType": "address", "name": "account", "type": "address"},
                ],
                "name": "grantRole",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "role", "type": "bytes32"},
                    {"internalType": "address", "name": "account", "type": "address"},
                ],
                "name": "hasRole",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function",
            },
        ]

        checksum_addr = Web3.to_checksum_address(contract_address)
        contract = w3.eth.contract(address=checksum_addr, abi=abi)

        # ── Read ANCHORER_ROLE bytes32 value from contract ────────────────────
        self.stdout.write("\nReading ANCHORER_ROLE from contract...")
        try:
            anchorer_role = contract.functions.ANCHORER_ROLE().call()
            self.stdout.write(f"ANCHORER_ROLE bytes32: 0x{anchorer_role.hex()}")
        except Exception as e:
            raise CommandError(f"Failed to read ANCHORER_ROLE from contract: {e}")

        # ── Check if backend already has the role ─────────────────────────────
        self.stdout.write("\nChecking current role assignment...")
        try:
            already_has_role = contract.functions.hasRole(
                anchorer_role,
                Web3.to_checksum_address(backend_address),
            ).call()
        except Exception as e:
            raise CommandError(f"hasRole() call failed: {e}")

        if already_has_role:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ {backend_address} already has ANCHORER_ROLE. Nothing to do!"
                )
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"\n⚠  {backend_address} does NOT have ANCHORER_ROLE. Granting now..."
            )
        )

        if dry_run:
            self.stdout.write(
                self.style.HTTP_INFO(
                    "\n[DRY RUN] Would call grantRole(ANCHORER_ROLE, backend_wallet). "
                    "No transaction sent."
                )
            )
            return

        # ── Check deployer balance ────────────────────────────────────────────
        deployer_balance_wei = w3.eth.get_balance(deployer_address)
        deployer_balance = w3.from_wei(deployer_balance_wei, "ether")
        self.stdout.write(f"Deployer balance: {deployer_balance:.6f} POL")

        if deployer_balance_wei == 0:
            raise CommandError(
                "Deployer wallet has 0 POL. Fund it from https://faucet.polygon.technology/"
            )

        # ── Build grantRole transaction ───────────────────────────────────────
        try:
            nonce = w3.eth.get_transaction_count(deployer_address)
            gas_price = w3.eth.gas_price

            tx = contract.functions.grantRole(
                anchorer_role,
                Web3.to_checksum_address(backend_address),
            ).build_transaction(
                {
                    "from": deployer_address,
                    "nonce": nonce,
                    "gas": 100000,
                    "gasPrice": gas_price,
                    "chainId": 80002,  # Polygon Amoy
                }
            )
        except Exception as e:
            raise CommandError(f"Failed to build grantRole transaction: {e}")

        # ── Sign & send ───────────────────────────────────────────────────────
        try:
            signed_tx = w3.eth.account.sign_transaction(tx, deployer_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            tx_hash_hex = tx_hash.hex()
            self.stdout.write(f"\nTransaction sent: {tx_hash_hex}")
            self.stdout.write(
                f"Track on Polygonscan: https://amoy.polygonscan.com/tx/{tx_hash_hex}"
            )
        except Exception as e:
            raise CommandError(f"Failed to send transaction: {e}")

        # ── Wait for confirmation ─────────────────────────────────────────────
        self.stdout.write("Waiting for transaction confirmation (up to 120s)...")
        try:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        except Exception as e:
            raise CommandError(
                f"Timed out waiting for receipt. Check Polygonscan manually: "
                f"https://amoy.polygonscan.com/tx/{tx_hash_hex}\nError: {e}"
            )

        if receipt["status"] != 1:
            raise CommandError(
                f"Transaction failed on-chain. Receipt: {receipt}"
            )

        # ── Verify role was granted ───────────────────────────────────────────
        has_role_now = contract.functions.hasRole(
            anchorer_role,
            Web3.to_checksum_address(backend_address),
        ).call()

        if has_role_now:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅  SUCCESS! ANCHORER_ROLE granted to {backend_address}\n"
                    f"   Block: {receipt['blockNumber']}\n"
                    f"   Gas used: {receipt['gasUsed']}\n"
                    f"   Tx: https://amoy.polygonscan.com/tx/{tx_hash_hex}\n\n"
                    "Restart your Django server and create a new batch to test anchoring."
                )
            )
        else:
            raise CommandError(
                "Transaction succeeded but hasRole() still returns False. "
                "This is unexpected — check the contract manually."
            )
