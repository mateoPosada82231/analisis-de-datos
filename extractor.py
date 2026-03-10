"""
extractor.py
Fetches IPS (Instituciones Prestadoras de Salud) data from datos.gov.co
(dataset ugc5-acjp), processes it with pandas, and stores the results in MySQL.

Usage:
    python extractor.py [--truncate]
"""

import json
import requests
import pandas as pd

import config
import database


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_date(value):
    """
    Return a 'YYYY-MM-DD' string or None.
    Handles both numeric strings like '20030409' and ISO-8601 timestamps.
    """
    if not value:
        return None
    try:
        s = str(value).strip()
        # Numeric format YYYYMMDD
        if s.isdigit() and len(s) == 8:
            return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
        return pd.to_datetime(s).strftime("%Y-%m-%d")
    except Exception:
        return None


def _safe_str(value, max_len=None):
    """Return a stripped string or None; optionally truncate to max_len."""
    if value is None:
        return None
    s = str(value).strip()
    if s in ("", "nan", "NaT", "None"):
        return None
    return s[:max_len] if max_len else s


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def fetch_data(url: str = config.API_URL, limit: int = config.API_LIMIT) -> list[dict]:
    """
    Download up to *limit* records from the Socrata-based API.
    Raises an exception if the HTTP request fails.
    """
    response = requests.get(url, params={"$limit": limit}, timeout=config.API_TIMEOUT)
    response.raise_for_status()
    return response.json()


# ---------------------------------------------------------------------------
# Processing
# ---------------------------------------------------------------------------

def process_data(raw_records: list[dict]) -> pd.DataFrame:
    """
    Convert the raw list of dictionaries into a cleaned pandas DataFrame.
    """
    if not raw_records:
        return pd.DataFrame()

    df = pd.DataFrame(raw_records)
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]
    return df


def build_db_records(df: pd.DataFrame) -> list[dict]:
    """
    Map a processed DataFrame to the list of dicts expected by
    database.insert_records().
    """
    records = []

    for _, row in df.iterrows():
        row_dict = row.where(pd.notna(row), other=None).to_dict()

        record = {
            "codigo_habilitacion": _safe_str(row_dict.get("codigo_habilitacion"), 50),
            "nombre_prestador":    _safe_str(row_dict.get("nombre_prestador"), 400),
            "nit":                 _safe_str(row_dict.get("nits_nit"), 50),
            "razon_social":        _safe_str(row_dict.get("razon_social"), 400),
            "clpr_codigo":         _safe_str(row_dict.get("clpr_codigo"), 10),
            "clpr_nombre":         _safe_str(row_dict.get("clpr_nombre"), 200),
            "departamento":        _safe_str(row_dict.get("depa_nombre"), 200),
            "municipio":           _safe_str(row_dict.get("muni_nombre"), 200),
            "ese":                 _safe_str(row_dict.get("ese"), 10),
            "direccion":           _safe_str(row_dict.get("direccion"), 400),
            "telefono":            _safe_str(row_dict.get("telefono"), 200),
            "email":               _safe_str(row_dict.get("email"), 300),
            "gerente":             _safe_str(row_dict.get("gerente"), 300),
            "nivel":               _safe_str(row_dict.get("nivel"), 50),
            "caracter":            _safe_str(row_dict.get("caracter"), 100),
            "habilitado":          _safe_str(row_dict.get("habilitado"), 10),
            "fecha_radicacion":    _safe_date(row_dict.get("fecha_radicacion")),
            "fecha_vencimiento":   _safe_date(row_dict.get("fecha_vencimiento")),
            "naju_nombre":         _safe_str(row_dict.get("naju_nombre"), 100),
            "raw_json": json.dumps(
                {k: str(v) if v is not None else None for k, v in row_dict.items()},
                ensure_ascii=False,
            ),
        }

        records.append(record)

    return records


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run(truncate: bool = False):
    """
    Full ETL pipeline:
    1. Ensure DB and table exist.
    2. Fetch raw data from the government API.
    3. Process with pandas.
    4. Optionally truncate existing rows.
    5. Insert into MySQL.
    """
    print("=== API-gobierno – Extractor de IPS Habilitadas ===")

    # -- Setup DB ---------------------------------------------------------
    print("[1/4] Asegurando que la base de datos y la tabla existen …")
    database.create_database()
    conn = database.get_connection()
    database.create_table(conn)

    # -- Fetch ------------------------------------------------------------
    print(f"[2/4] Descargando datos desde {config.API_URL} …")
    raw = fetch_data()
    print(f"      {len(raw)} registros descargados.")

    # -- Process ----------------------------------------------------------
    print("[3/4] Procesando datos con pandas …")
    df = process_data(raw)
    print(f"      DataFrame: {df.shape[0]} filas × {df.shape[1]} columnas.")
    print(f"      Columnas: {list(df.columns)}")
    db_records = build_db_records(df)

    # -- Store ------------------------------------------------------------
    print("[4/4] Almacenando datos en MySQL …")
    if truncate:
        database.truncate_table(conn)
        print("      Filas anteriores eliminadas (truncate=True).")
    inserted = database.insert_records(conn, db_records)
    print(f"      {inserted} filas insertadas en '{config.DB_NAME}.ips'.")

    conn.close()
    print("Listo.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Descarga y almacena datos de IPS Habilitadas de datos.gov.co."
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Vacía la tabla ips antes de insertar nuevos datos.",
    )
    args = parser.parse_args()
    run(truncate=args.truncate)
