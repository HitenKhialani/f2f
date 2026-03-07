from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name = 'supplychain_cropbatch' ORDER BY ordinal_position;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Column: {row[0]}, Nullable: {row[1]}, Default: {row[2]}, Type: {row[3]}")
