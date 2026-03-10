"""
app.py
FastAPI REST API that exposes the precipitation data stored in MySQL.

Interactive docs are available at:
    http://localhost:5000/docs   (Swagger UI)
    http://localhost:5000/redoc  (ReDoc)

Endpoints
---------
GET /health
    Simple health-check.

GET /precipitaciones
    Query parameters:
        departamento  – filter by department name (case-insensitive, partial match)
        municipio     – filter by municipality name (case-insensitive, partial match)
        fecha_inicio  – include records on or after this date (YYYY-MM-DD)
        fecha_fin     – include records on or before this date (YYYY-MM-DD)
        limit         – max rows to return (1–1000, default 100)
        offset        – pagination offset (default 0)

GET /precipitaciones/{id}
    Return a single record by its primary key.

GET /estadisticas
    Aggregate statistics (count, avg, max, min precipitation) per department.

GET /departamentos
    Sorted list of all distinct departments in the table.

Usage:
    python app.py
    # or directly with uvicorn:
    uvicorn app:app --host 0.0.0.0 --port 5000 --reload
"""

from __future__ import annotations

from typing import Optional
from datetime import date

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import uvicorn

import config
import database

app = FastAPI(
    title="API Precipitaciones – datos.gov.co",
    description=(
        "API REST para consultar registros de precipitaciones obtenidos del portal "
        "de datos abiertos del gobierno colombiano (dataset ksew-j3zj)."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Pydantic response models (improve /docs readability and type safety)
# ---------------------------------------------------------------------------

class Precipitacion(BaseModel):
    id: int
    codigo_estacion: Optional[str]
    nombre_estacion: Optional[str]
    departamento: Optional[str]
    municipio: Optional[str]
    fecha: Optional[str]
    valor_mm: Optional[float]
    latitud: Optional[float]
    longitud: Optional[float]
    altitud: Optional[float]
    created_at: Optional[str]


class PrecipitacionesResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: list[Precipitacion]


class EstadisticaDepartamento(BaseModel):
    departamento: Optional[str]
    total_registros: int
    promedio_mm: Optional[float]
    max_mm: Optional[float]
    min_mm: Optional[float]


class EstadisticasResponse(BaseModel):
    data: list[EstadisticaDepartamento]


class DepartamentosResponse(BaseModel):
    departamentos: list[str]


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


@app.get("/precipitaciones", response_model=PrecipitacionesResponse, tags=["Precipitaciones"])
def get_precipitaciones(
    departamento: Optional[str] = Query(None, description="Filtrar por departamento (coincidencia parcial)"),
    municipio: Optional[str]    = Query(None, description="Filtrar por municipio (coincidencia parcial)"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha mínima del registro (YYYY-MM-DD)"),
    fecha_fin: Optional[date]    = Query(None, description="Fecha máxima del registro (YYYY-MM-DD)"),
    limit: int  = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    offset: int = Query(0,   ge=0,          description="Desplazamiento para paginación"),
):
    """
    Retorna registros de precipitaciones con filtros opcionales y paginación.
    """
    where_clauses: list[str] = []
    params: list = []

    if departamento:
        where_clauses.append("LOWER(departamento) LIKE %s")
        params.append(f"%{departamento.lower()}%")
    if municipio:
        where_clauses.append("LOWER(municipio) LIKE %s")
        params.append(f"%{municipio.lower()}%")
    if fecha_inicio:
        where_clauses.append("fecha >= %s")
        params.append(str(fecha_inicio))
    if fecha_fin:
        where_clauses.append("fecha <= %s")
        params.append(str(fecha_fin))

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    count_sql = f"SELECT COUNT(*) FROM precipitaciones {where_sql}"
    page_sql = f"""
        SELECT id, codigo_estacion, nombre_estacion, departamento, municipio,
               fecha, valor_mm, latitud, longitud, altitud, created_at
        FROM precipitaciones
        {where_sql}
        ORDER BY fecha DESC, id DESC
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


@app.get("/precipitaciones/{record_id}", response_model=Precipitacion, tags=["Precipitaciones"])
def get_precipitacion(record_id: int):
    """
    Retorna un único registro de precipitación por su ID.
    """
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, codigo_estacion, nombre_estacion, departamento, municipio,
               fecha, valor_mm, latitud, longitud, altitud, created_at
        FROM precipitaciones
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
    """
    Retorna estadísticas agregadas de precipitación (conteo, promedio, máx, mín)
    agrupadas por departamento.
    """
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            departamento,
            COUNT(*)                AS total_registros,
            ROUND(AVG(valor_mm), 2) AS promedio_mm,
            MAX(valor_mm)           AS max_mm,
            MIN(valor_mm)           AS min_mm
        FROM precipitaciones
        WHERE valor_mm IS NOT NULL
        GROUP BY departamento
        ORDER BY promedio_mm DESC
        """
    )
    rows = _rows_to_dicts(cursor)
    cursor.close()
    conn.close()
    return {"data": rows}


@app.get("/departamentos", response_model=DepartamentosResponse, tags=["General"])
def get_departamentos():
    """
    Retorna la lista de departamentos distintos presentes en la tabla.
    """
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT departamento FROM precipitaciones "
        "WHERE departamento IS NOT NULL ORDER BY departamento"
    )
    departments = [r[0] for r in cursor.fetchall()]
    cursor.close()
    conn.close()
    return {"departamentos": departments}


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
