import sqlite3
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "career_explorer.db"

UPDATE_INTERVAL_DAYS = 120


def check_last_update():
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT updated_at
        FROM data_updates
        WHERE source = 'BLS Public Data API'
          AND status = 'success'
        ORDER BY updated_at DESC
        LIMIT 1
    """)

    result = cursor.fetchone()
    connection.close()

    if result is None:
        print("No successful BLS update has been recorded.")
        print("Update is required.")
        return

    last_update = datetime.fromisoformat(result[0])
    now = datetime.now(timezone.utc)

    days_since_update = (now - last_update).days

    print(f"Last BLS update: {last_update.isoformat()}")
    print(f"Days since update: {days_since_update}")
    print(f"Update interval: {UPDATE_INTERVAL_DAYS} days")

    if days_since_update >= UPDATE_INTERVAL_DAYS:
        print("BLS update is due.")
    else:
        days_remaining = UPDATE_INTERVAL_DAYS - days_since_update
        print(f"BLS update is not due yet. {days_remaining} days remaining.")


if __name__ == "__main__":
    check_last_update()