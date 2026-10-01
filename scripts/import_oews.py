import sqlite3
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "career_explorer.db"
ZIP_PATH = PROJECT_ROOT / "data" / "oesm25all.zip"

OEWS_FILE = "oesm25all/all_data_M_2025.xlsx"


def load_oews_data():
    with zipfile.ZipFile(ZIP_PATH) as archive:
        with archive.open(OEWS_FILE) as excel_file:
            return pd.read_excel(excel_file)


def import_career_data():
    dataframe = load_oews_data()

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT soc_code
        FROM careers
        """
    )

    careers = [row[0] for row in cursor.fetchall()]

    imported = 0

    for soc_code in careers:
        matching_rows = dataframe[
            (dataframe["AREA"] == 99)
            & (dataframe["NAICS"] == "000000")
            & (dataframe["OWN_CODE"] == 1235)
            & (dataframe["OCC_CODE"] == soc_code)
        ]

        if matching_rows.empty:
            print(f"Warning: No OEWS data found for {soc_code}")
            continue

        row = matching_rows.iloc[0]

        def to_float(value):
            if pd.isna(value) or value == "*":
                return None
            return float(value)


        def to_int(value):
            if pd.isna(value) or value == "*":
                return None
            return int(float(value))

        cursor.execute(
            """
            INSERT INTO bls_occupation_snapshots (
                soc_code,
                occupation_title,
                data_year,
                data_period,
                employment,
                mean_hourly_wage,
                mean_annual_wage,
                median_annual_wage,
                wage_10th_percentile,
                wage_25th_percentile,
                wage_75th_percentile,
                wage_90th_percentile,
                source,
                retrieved_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(soc_code, data_year, data_period)
            DO UPDATE SET
                occupation_title = excluded.occupation_title,
                employment = excluded.employment,
                mean_hourly_wage = excluded.mean_hourly_wage,
                mean_annual_wage = excluded.mean_annual_wage,
                median_annual_wage = excluded.median_annual_wage,
                wage_10th_percentile = excluded.wage_10th_percentile,
                wage_25th_percentile = excluded.wage_25th_percentile,
                wage_75th_percentile = excluded.wage_75th_percentile,
                wage_90th_percentile = excluded.wage_90th_percentile,
                retrieved_at = excluded.retrieved_at
            """,
            (
                soc_code,
                row["OCC_TITLE"],
                2025,
                "May",
                to_int(row["TOT_EMP"]),
                to_float(row["H_MEAN"]),
                to_float(row["A_MEAN"]),
                to_float(row["A_MEDIAN"]),
                to_float(row["A_PCT10"]),
                to_float(row["A_PCT25"]),
                to_float(row["A_PCT75"]),
                to_float(row["A_PCT90"]),
                "BLS OEWS May 2025 National",
                datetime.now(timezone.utc).isoformat(),
            ),
        )

        imported += 1
        print(
            f"Imported: {soc_code} - {row['OCC_TITLE']}"
        )

    connection.commit()
    connection.close()

    print(f"\nOEWS import complete. {imported} careers imported.")


if __name__ == "__main__":
    import_career_data()