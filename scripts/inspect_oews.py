import zipfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ZIP_PATH = PROJECT_ROOT / "data" / "oesm25all.zip"

with zipfile.ZipFile(ZIP_PATH) as archive:
    excel_file = archive.open("oesm25all/all_data_M_2025.xlsx")

    print("OEWS file found:")
    print(excel_file.name)

    import pandas as pd

    dataframe = pd.read_excel(excel_file)

    print("\nColumns:")
    for column in dataframe.columns:
        print(f"- {column}")

    print("\nFirst 5 rows:")
    print(dataframe.head().to_string())