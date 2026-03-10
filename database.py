"""
database.py
Handles MySQL connection, schema creation, and data persistence
for the IPS Habilitadas dataset (datos.gov.co – ugc5-acjp).
"""

import config
import mysql.connector


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
    """Create the *ips* table if it does not exist."""
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ips (
            id                   INT AUTO_INCREMENT PRIMARY KEY,
            codigo_habilitacion  VARCHAR(50),
            nombre_prestador     VARCHAR(400),
            nit                  VARCHAR(50),
            razon_social         VARCHAR(400),
            clpr_codigo          VARCHAR(10),
            clpr_nombre          VARCHAR(200),
            departamento         VARCHAR(200),
            municipio            VARCHAR(200),
            ese                  VARCHAR(10),
            direccion            VARCHAR(400),
            telefono             VARCHAR(200),
            email                VARCHAR(300),
            gerente              VARCHAR(300),
            nivel                VARCHAR(50),
            caracter             VARCHAR(100),
            habilitado           VARCHAR(10),
            fecha_radicacion     DATE,
            fecha_vencimiento    DATE,
            naju_nombre          VARCHAR(100),
            raw_json             JSON,
            created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    cursor.close()


def insert_records(conn, records, batch_size=200):
    """
    Insert a list of dicts (one per IPS) into the ips table in batches.
    Returns the number of rows inserted.
    """
    if not records:
        return 0

    sql = """
        INSERT INTO ips (
            codigo_habilitacion, nombre_prestador, nit, razon_social,
            clpr_codigo, clpr_nombre, departamento, municipio, ese,
            direccion, telefono, email, gerente, nivel, caracter,
            habilitado, fecha_radicacion, fecha_vencimiento, naju_nombre, raw_json
        ) VALUES (
            %(codigo_habilitacion)s, %(nombre_prestador)s, %(nit)s, %(razon_social)s,
            %(clpr_codigo)s, %(clpr_nombre)s, %(departamento)s, %(municipio)s, %(ese)s,
            %(direccion)s, %(telefono)s, %(email)s, %(gerente)s, %(nivel)s, %(caracter)s,
            %(habilitado)s, %(fecha_radicacion)s, %(fecha_vencimiento)s, %(naju_nombre)s, %(raw_json)s
        )
    """
    cursor = conn.cursor()
    inserted = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        cursor.executemany(sql, batch)
        conn.commit()
        inserted += cursor.rowcount
    cursor.close()
    return inserted


def truncate_table(conn):
    """Remove all rows from the ips table (for a fresh load)."""
    cursor = conn.cursor()
    cursor.execute("TRUNCATE TABLE ips")
    conn.commit()
    cursor.close()

