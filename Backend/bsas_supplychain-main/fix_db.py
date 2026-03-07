from django.db import connection
with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE supplychain_cropbatch ALTER COLUMN anchor_tx_hash DROP NOT NULL;")
        print("Successfully dropped NOT NULL for anchor_tx_hash")
    except Exception as e:
        print(f"Error for anchor_tx_hash: {e}")
    
    try:
        cursor.execute("ALTER TABLE supplychain_cropbatch ALTER COLUMN anchor_block_number DROP NOT NULL;")
        print("Successfully dropped NOT NULL for anchor_block_number")
    except Exception as e:
        print(f"Error for anchor_block_number: {e}")
    
    try:
        cursor.execute("ALTER TABLE supplychain_cropbatch ALTER COLUMN anchored_snapshot_hash DROP NOT NULL;")
        print("Successfully dropped NOT NULL for anchored_snapshot_hash")
    except Exception as e:
        print(f"Error for anchored_snapshot_hash: {e}")
