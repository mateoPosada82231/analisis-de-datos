"""
database.py
Handles MySQL connection, schema creation, and data persistence
for the Precipitaciones dataset (datos.gov.co – ksew-j3zj).
"""

import mysql.connector
import config


def get_connection():
    """Create and return a MySQL connection using settings from config.py."""
    return mysql.connector.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
    )


def create_database():
    """Create the database if it does not yet exist."""
    db_name = config.DB_NAME
    if not db_name.replace("_", "").isalnum():
        raise ValueError(f"Invalid database name: {db_name!r}")
    conn = mysql.connector.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config.DB_NAME}")
    conn.commit()
    cursor.close()
    conn.close()


def create_table(conn):
    """Create the *precipitaciones* table if it does not exist."""
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS precipitaciones (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            codigo_estacion     VARCHAR(50),
            nombre_estacion     VARCHAR(300),
            departamento        VARCHAR(200),
            municipio           VARCHAR(200),
            fecha               DATE,
            valor_mm            DECIMAL(10,2),
            latitud             DECIMAL(10,6),
            longitud            DECIMAL(10,6),
            altitud             DECIMAL(10,2),
            raw_json            JSON,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    cursor.close()


def insert_records(conn, records):
    """
    Insert a list of dicts (one per measurement) into the precipitaciones table.
    Returns the number of rows inserted.
    """
    if not records:
        return 0

    sql = """
        INSERT INTO precipitaciones (
            codigo_estacion, nombre_estacion, departamento, municipio,
            fecha, valor_mm, latitud, longitud, altitud, raw_json
        ) VALUES (
            %(codigo_estacion)s, %(nombre_estacion)s, %(departamento)s, %(municipio)s,
            %(fecha)s, %(valor_mm)s, %(latitud)s, %(longitud)s, %(altitud)s, %(raw_json)s
        )
    """
    cursor = conn.cursor()
    cursor.executemany(sql, records)
    conn.commit()
    inserted = cursor.rowcount
    cursor.close()
    return inserted


def truncate_table(conn):
    """Remove all rows from the precipitaciones table (for a fresh load)."""
    cursor = conn.cursor()
    cursor.execute("TRUNCATE TABLE precipitaciones")
    conn.commit()
    cursor.close()

