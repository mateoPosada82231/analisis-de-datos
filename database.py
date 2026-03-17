"""PostgreSQL utilities for API-gobierno (schema + persistence)."""

from __future__ import annotations

import config
import psycopg2
from psycopg2 import sql
from psycopg2.extras import Json


def get_connection():
    """Create and return a PostgreSQL connection using config.py values."""
    return psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        dbname=config.DB_NAME,
    )


def create_database():
    """Create the configured PostgreSQL database if it does not exist."""
    db_name = config.DB_NAME
    if not db_name.replace("_", "").isalnum():
        raise ValueError(f"Invalid database name: {db_name!r}")

    conn = psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        dbname="postgres",
    )
    conn.autocommit = True
    cursor = conn.cursor()

    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
    exists = cursor.fetchone() is not None
    if not exists:
        cursor.execute(sql.SQL("CREATE DATABASE {}") .format(sql.Identifier(db_name)))

    cursor.close()
    conn.close()


def create_table(conn):
    """Create the ips table in PostgreSQL if it does not exist."""
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ips (
            id                  BIGSERIAL PRIMARY KEY,
            codigo_habilitacion VARCHAR(50),
            nombre_prestador    VARCHAR(400),
            nit                 VARCHAR(50),
            razon_social        VARCHAR(400),
            clpr_codigo         VARCHAR(10),
            clpr_nombre         VARCHAR(200),
            departamento        VARCHAR(200),
            municipio           VARCHAR(200),
            ese                 VARCHAR(10),
            direccion           VARCHAR(400),
            telefono            VARCHAR(200),
            email               VARCHAR(300),
            gerente             VARCHAR(300),
            nivel               VARCHAR(50),
            caracter            VARCHAR(100),
            habilitado          VARCHAR(10),
            fecha_radicacion    DATE,
            fecha_vencimiento   DATE,
            naju_nombre         VARCHAR(100),
            raw_json            JSONB,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    cursor.close()


def insert_records(conn, records, batch_size=200):
    """Insert many IPS records in batches and return inserted row count."""
    if not records:
        return 0

    sql_insert = """
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
        prepared = []
        for row in batch:
            row_copy = dict(row)
            row_copy["raw_json"] = Json(row_copy.get("raw_json")) if row_copy.get("raw_json") else None
            prepared.append(row_copy)

        cursor.executemany(sql_insert, prepared)
        conn.commit()
        inserted += cursor.rowcount

    cursor.close()
    return inserted


def truncate_table(conn):
    """Clear the ips table and reset identity sequence."""
    cursor = conn.cursor()
    cursor.execute("TRUNCATE TABLE ips RESTART IDENTITY")
    conn.commit()
    cursor.close()
