import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "career_explorer.db"

careers = [
    ("15-1252", "Software Developers"),
    ("15-1211", "Computer Systems Analysts"),
    ("15-1212", "Information Security Analysts"),
    ("15-1242", "Database Administrators and Architects"),
    ("15-1244", "Network and Computer Systems Administrators"),
    ("15-1254", "Web Developers"),
    ("15-1241", "Computer Network Architects"),
]

connection = sqlite3.connect(DATABASE_PATH)
cursor = connection.cursor()

for soc_code, title in careers:
    cursor.execute(
        """
        INSERT INTO careers (soc_code, title)
        VALUES (?, ?)
        ON CONFLICT(soc_code)
        DO UPDATE SET title = excluded.title
        """,
        (soc_code, title),
    )

connection.commit()
connection.close()

print(f"Career catalog updated: {len(careers)} careers.")