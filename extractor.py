"""
extractor.py
Fetches precipitation data from datos.gov.co (dataset ksew-j3zj),
processes it with pandas, and stores the results in MySQL.

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
    """Return a 'YYYY-MM-DD' string or None from an ISO-8601 timestamp."""
    if not value:
        return None
    try:
        return pd.to_datetime(value).strftime("%Y-%m-%d")
    except Exception:
        return None


def _safe_decimal(value):
    """Return a float or None from an arbitrary string."""
    if value is None:
        return None
    try:
        return float(str(value).replace(",", ".").strip())
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def fetch_data(url: str = config.API_URL, limit: int = config.API_LIMIT) -> list[dict]:
    """
    Download up to *limit* records from the Socrata-based API.
    Raises an exception if the HTTP request fails.
    """
    params = {"$limit": limit}
    response = requests.get(url, params=params, timeout=config.API_TIMEOUT)
    response.raise_for_status()
    return response.json()


# ---------------------------------------------------------------------------
# Processing
# ---------------------------------------------------------------------------

def process_data(raw_records: list[dict]) -> pd.DataFrame:
    """
    Convert the raw list of dictionaries into a cleaned pandas DataFrame.
    Column names are normalised and obvious data-type conversions are applied.
    """
    if not raw_records:
        return pd.DataFrame()

    df = pd.DataFrame(raw_records)

    # Lower-case all column names and replace spaces with underscores
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]

    # Attempt to cast numeric columns
    numeric_candidates = [
        "valor",
        "valorobservado",
        "valor_observado",
        "latitud",
        "longitud",
        "altitud",
    ]
    for col in numeric_candidates:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Attempt to parse date columns
    date_candidates = ["fecha", "fechaobservacion", "fecha_observacion"]
    for col in date_candidates:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    return df


def build_db_records(df: pd.DataFrame) -> list[dict]:
    """
    Map a processed DataFrame to the list of dicts expected by
    database.insert_records().  Unknown fields are preserved in *raw_json*.
    """
    records = []

    # Column-name aliases: target field → list of possible source columns
    col_map = {
        "codigo_estacion":  ["codigoestacion", "codigo_estacion", "cod_estacion"],
        "nombre_estacion":  ["nombreestacion", "nombre_estacion", "estacion"],
        "departamento":     ["departamento", "nombredepto", "depto"],
        "municipio":        ["municipio", "nombremunicipio", "ciudad"],
        "fecha":            ["fecha", "fechaobservacion", "fecha_observacion"],
        "valor_mm":         ["valor", "valorobservado", "valor_observado", "precipitacion_mm"],
        "latitud":          ["latitud", "lat"],
        "longitud":         ["longitud", "lon", "lng"],
        "altitud":          ["altitud", "elevacion", "altura"],
    }

    def _pick(row, aliases):
        for alias in aliases:
            val = row.get(alias)
            if val is not None and str(val).strip() not in ("", "nan", "NaT"):
                return str(val).strip()
        return None

    for _, row in df.iterrows():
        row_dict = row.where(pd.notna(row), other=None).to_dict()

        record = {target: _pick(row_dict, aliases) for target, aliases in col_map.items()}

        # Type coercions for MySQL
        record["valor_mm"] = _safe_decimal(record["valor_mm"])
        record["latitud"]  = _safe_decimal(record["latitud"])
        record["longitud"] = _safe_decimal(record["longitud"])
        record["altitud"]  = _safe_decimal(record["altitud"])
        record["fecha"]    = _safe_date(record["fecha"])

        # Store the full original row as JSON for reference
        record["raw_json"] = json.dumps(
            {k: str(v) if v is not None else None for k, v in row_dict.items()},
            ensure_ascii=False,
        )

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
    print("=== API-gobierno – Extractor de Precipitaciones ===")

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
    db_records = build_db_records(df)

    # -- Store ------------------------------------------------------------
    print("[4/4] Almacenando datos en MySQL …")
    if truncate:
        database.truncate_table(conn)
        print("      Filas anteriores eliminadas (truncate=True).")
    inserted = database.insert_records(conn, db_records)
    print(f"      {inserted} filas insertadas en '{config.DB_NAME}.precipitaciones'.")

    conn.close()
    print("Listo.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Descarga y almacena datos de precipitaciones de datos.gov.co."
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Vacía la tabla precipitaciones antes de insertar nuevos datos.",
    )
    args = parser.parse_args()
    run(truncate=args.truncate)
