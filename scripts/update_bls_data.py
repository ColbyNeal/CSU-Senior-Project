import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "career_explorer.db"

BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Test series: U.S. unemployment rate
DEFAULT_SERIES_ID = "LNS14000000"


def get_bls_data(series_id):
    url = f"{BLS_API_URL}{series_id}?latest=true"

    request = Request(
        url,
        headers={
            "User-Agent": "CSU-Senior-Project/1.0"
        },
    )

    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def update_database(series_id):
    data = get_bls_data(series_id)

    if data.get("status") != "REQUEST_SUCCEEDED":
        raise RuntimeError(
            data.get("message", ["BLS API request failed."])
        )

    series = data["Results"]["series"][0]
    latest = series["data"][0]

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute(
    """
    INSERT INTO bls_series
    (series_id, year, period, period_name, value)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(series_id, year, period)
    DO UPDATE SET
        period_name = excluded.period_name,
        value = excluded.value
    """,
        (
            series["seriesID"],
            int(latest["year"]),
            latest["period"],
            latest["periodName"],
            float(latest["value"]),
        ),
    )
    cursor.execute(
        """
        INSERT INTO data_updates
        (source, updated_at, records_added, records_updated, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            "BLS Public Data API",
            datetime.now(timezone.utc).isoformat(),
            1,
            0,
            "success",
        ),
    )

    connection.commit()
    connection.close()

    print("BLS update successful.")
    print(f"Series: {series['seriesID']}")
    print(f"Year: {latest['year']}")
    print(f"Period: {latest['periodName']}")
    print(f"Value: {latest['value']}")


if __name__ == "__main__":
    series_id = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SERIES_ID
    update_database(series_id)