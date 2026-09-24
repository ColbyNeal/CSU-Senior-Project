import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATABASE_PATH = DATA_DIR / "career_explorer.db"

DATA_DIR.mkdir(exist_ok=True)

connection = sqlite3.connect(DATABASE_PATH)
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    soc_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    data_source TEXT DEFAULT 'BLS OEWS'
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS wages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    soc_code TEXT NOT NULL,
    year INTEGER NOT NULL,
    area TEXT NOT NULL,
    median_wage REAL,
    entry_wage REAL,
    experienced_wage REAL,
    FOREIGN KEY (soc_code) REFERENCES careers(soc_code)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS employment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    soc_code TEXT NOT NULL,
    year INTEGER NOT NULL,
    employment INTEGER,
    projected_employment INTEGER,
    growth_percent REAL,
    FOREIGN KEY (soc_code) REFERENCES careers(soc_code)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS bls_occupation_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    soc_code TEXT NOT NULL,
    occupation_title TEXT NOT NULL,
    data_year INTEGER NOT NULL,
    data_period TEXT NOT NULL,
    employment INTEGER,
    mean_hourly_wage REAL,
    mean_annual_wage REAL,
    median_annual_wage REAL,
    wage_10th_percentile REAL,
    wage_25th_percentile REAL,
    wage_75th_percentile REAL,
    wage_90th_percentile REAL,
    source TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    UNIQUE(soc_code, data_year, data_period)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS bls_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    period TEXT NOT NULL,
    period_name TEXT,
    value REAL NOT NULL,
    UNIQUE(series_id, year, period)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS data_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    records_added INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    status TEXT NOT NULL
)
""")

connection.commit()
connection.close()

print(f"Database created successfully: {DATABASE_PATH}")