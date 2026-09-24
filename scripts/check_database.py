import sqlite3

connection = sqlite3.connect("data/career_explorer.db")

cursor = connection.cursor()

cursor.execute(
    "SELECT name FROM sqlite_master WHERE type = ? ORDER BY name",
    ("table",),
)

tables = cursor.fetchall()

print("Database tables:")

for table in tables:
    print(f"- {table[0]}")

if any(table[0] == "bls_occupation_snapshots" for table in tables):
    print("\nBLS occupation snapshot table: READY")
else:
    print("\nBLS occupation snapshot table: NOT FOUND")

connection.close()