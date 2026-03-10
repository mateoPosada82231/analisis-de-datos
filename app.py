"""
app.py
FastAPI REST API that exposes IPS Habilitadas data stored in MySQL.

Interactive docs are available at:
    http://localhost:5000/docs   (Swagger UI)
    http://localhost:5000/redoc  (ReDoc)

Endpoints
---------
GET /health
    Simple health-check.

GET /ips
    Query parameters:
        departamento  – filter by department name (case-insensitive, partial match)
        municipio     – filter by municipality name (case-insensitive, partial match)
        habilitado    – filter by enabled status (SI / NO)
        clpr_nombre   – filter by provider class (partial match)
        naju_nombre   – filter by legal nature (Pública / Privada)
        limit         – max rows to return (1–1000, default 100)
        offset        – pagination offset (default 0)

GET /ips/{id}
    Return a single IPS record by its primary key.

GET /estadisticas
    Count of IPS per department, ordered by total descending.

GET /departamentos
    Sorted list of all distinct departments in the table.

GET /clases
    Sorted list of all distinct provider classes (clpr_nombre).

Usage:
    python app.py
    # or directly with uvicorn:
    uvicorn app:app --host 0.0.0.0 --port 5000 --reload
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import uvicorn

import config
import database

app = FastAPI(
    title="API IPS Habilitadas – datos.gov.co",
    description=(
        "API REST para consultar Instituciones Prestadoras de Salud (IPS) habilitadas "
        "obtenidas del portal de datos abiertos del gobierno colombiano (dataset ugc5-acjp)."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Pydantic response models
# ---------------------------------------------------------------------------

class IPS(BaseModel):
    id: int
    codigo_habilitacion: Optional[str]
    nombre_prestador: Optional[str]
    nit: Optional[str]
    razon_social: Optional[str]
    clpr_codigo: Optional[str]
    clpr_nombre: Optional[str]
    departamento: Optional[str]
    municipio: Optional[str]
    ese: Optional[str]
    direccion: Optional[str]
    telefono: Optional[str]
    email: Optional[str]
    gerente: Optional[str]
    nivel: Optional[str]
    caracter: Optional[str]
    habilitado: Optional[str]
    fecha_radicacion: Optional[str]
    fecha_vencimiento: Optional[str]
    naju_nombre: Optional[str]
    created_at: Optional[str]


class IPSResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: list[IPS]


class EstadisticaDepartamento(BaseModel):
    departamento: Optional[str]
    total_ips: int


class EstadisticasResponse(BaseModel):
    data: list[EstadisticaDepartamento]


class DepartamentosResponse(BaseModel):
    departamentos: list[str]


class ClasesResponse(BaseModel):
    clases: list[str]


class HealthResponse(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _rows_to_dicts(cursor) -> list[dict]:
    """Convert all fetched rows to a list of dicts using cursor description."""
    cols = [col[0] for col in cursor.description]
    return [
        {col: (str(val) if hasattr(val, "isoformat") else val) for col, val in zip(cols, row)}
        for row in cursor.fetchall()
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["General"])
def health():
    """Verifica que la API está en línea."""
    return {"status": "ok"}


@app.get("/ips", response_model=IPSResponse, tags=["IPS"])
def get_ips(
    departamento: Optional[str] = Query(None, description="Filtrar por departamento (coincidencia parcial)"),
    municipio: Optional[str]    = Query(None, description="Filtrar por municipio (coincidencia parcial)"),
    habilitado: Optional[str]   = Query(None, description="Filtrar por estado (SI / NO)"),
    clpr_nombre: Optional[str]  = Query(None, description="Filtrar por clase de prestador (coincidencia parcial)"),
    naju_nombre: Optional[str]  = Query(None, description="Filtrar por naturaleza jurídica (Pública / Privada)"),
    limit: int  = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    offset: int = Query(0,   ge=0,          description="Desplazamiento para paginación"),
):
    """Retorna registros de IPS habilitadas con filtros opcionales y paginación."""
    where_clauses: list[str] = []
    params: list = []

    if departamento:
        where_clauses.append("LOWER(departamento) LIKE %s")
        params.append(f"%{departamento.lower()}%")
    if municipio:
        where_clauses.append("LOWER(municipio) LIKE %s")
        params.append(f"%{municipio.lower()}%")
    if habilitado:
        where_clauses.append("UPPER(habilitado) = %s")
        params.append(habilitado.upper())
    if clpr_nombre:
        where_clauses.append("LOWER(clpr_nombre) LIKE %s")
        params.append(f"%{clpr_nombre.lower()}%")
    if naju_nombre:
        where_clauses.append("LOWER(naju_nombre) LIKE %s")
        params.append(f"%{naju_nombre.lower()}%")

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    count_sql = f"SELECT COUNT(*) FROM ips {where_sql}"
    page_sql = f"""
        SELECT id, codigo_habilitacion, nombre_prestador, nit, razon_social,
               clpr_codigo, clpr_nombre, departamento, municipio, ese,
               direccion, telefono, email, gerente, nivel, caracter,
               habilitado, fecha_radicacion, fecha_vencimiento, naju_nombre, created_at
        FROM ips
        {where_sql}
        ORDER BY departamento, nombre_prestador
        LIMIT %s OFFSET %s
    """

    conn = database.get_connection()
    cursor = conn.cursor()

    cursor.execute(count_sql, params)
    total = cursor.fetchone()[0]

    cursor.execute(page_sql, params + [limit, offset])
    rows = _rows_to_dicts(cursor)

    cursor.close()
    conn.close()

    return {"total": total, "limit": limit, "offset": offset, "data": rows}


@app.get("/ips/{record_id}", response_model=IPS, tags=["IPS"])
def get_ips_by_id(record_id: int):
    """Retorna un único registro de IPS por su ID."""
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, codigo_habilitacion, nombre_prestador, nit, razon_social,
               clpr_codigo, clpr_nombre, departamento, municipio, ese,
               direccion, telefono, email, gerente, nivel, caracter,
               habilitado, fecha_radicacion, fecha_vencimiento, naju_nombre, created_at
        FROM ips
        WHERE id = %s
        """,
        (record_id,),
    )
    cols = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    return {col: (str(val) if hasattr(val, "isoformat") else val) for col, val in zip(cols, row)}


@app.get("/estadisticas", response_model=EstadisticasResponse, tags=["Estadísticas"])
def get_estadisticas():
    """Retorna el conteo de IPS habilitadas agrupadas por departamento."""
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT departamento, COUNT(*) AS total_ips
        FROM ips
        WHERE departamento IS NOT NULL
        GROUP BY departamento
        ORDER BY total_ips DESC
        """
    )
    rows = _rows_to_dicts(cursor)
    cursor.close()
    conn.close()
    return {"data": rows}


@app.get("/departamentos", response_model=DepartamentosResponse, tags=["General"])
def get_departamentos():
    """Retorna la lista de departamentos distintos presentes en la tabla."""
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT departamento FROM ips "
        "WHERE departamento IS NOT NULL ORDER BY departamento"
    )
    departments = [r[0] for r in cursor.fetchall()]
    cursor.close()
    conn.close()
    return {"departamentos": departments}


@app.get("/clases", response_model=ClasesResponse, tags=["General"])
def get_clases():
    """Retorna la lista de clases de prestador distintas (clpr_nombre)."""
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT clpr_nombre FROM ips "
        "WHERE clpr_nombre IS NOT NULL ORDER BY clpr_nombre"
    )
    clases = [r[0] for r in cursor.fetchall()]
    cursor.close()
    conn.close()
    return {"clases": clases}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=config.API_RELOAD,
    )
