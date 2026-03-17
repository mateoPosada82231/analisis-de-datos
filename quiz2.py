"""
quiz2.py
Equipo 2 – Quiz #2 Avanzado: Análisis de Datos con API en Python

Fuente de datos (Equipo 2):
    https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=2000&$offset=2000

Requerimientos implementados
-----------------------------
1.  Procesamiento de exactamente 2000 registros desde la API.
2.  Extracción de: entidad, nombre_del_proveedor, valor_total_adjudicacion,
    estado_del_procedimiento (valor por defecto: "No disponible").
3.  Conversión de valor_total_adjudicacion a numérico (0 si no es convertible).
4.  Clasificación por valor: Bajo / Medio / Alto.
5.  Clasificación por estado: Adjudicado / No adjudicado / Otro estado.
6.  Presentación de resultados en pantalla.

Uso:
    python quiz2.py
"""

from __future__ import annotations

import requests

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

API_URL = "https://www.datos.gov.co/resource/p6dx-8zbt.json"
LIMIT = 2000
OFFSET = 2000  # Equipo 2
TIMEOUT = 30

UMBRAL_BAJO = 50_000_000
UMBRAL_MEDIO = 200_000_000
UMBRAL_ALTO_ESPECIAL = 1_000_000_000


# ---------------------------------------------------------------------------
# Extracción
# ---------------------------------------------------------------------------

def fetch_data() -> list[dict]:
    """Descarga los 2000 registros correspondientes al Equipo 2."""
    try:
        response = requests.get(
            API_URL,
            params={"$limit": LIMIT, "$offset": OFFSET},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError as exc:
        raise SystemExit(
            f"Error HTTP {exc.response.status_code} al consultar la API: {exc}"
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise SystemExit(f"Error de conexión con la API: {exc}") from exc
    return response.json()


# ---------------------------------------------------------------------------
# Procesamiento
# ---------------------------------------------------------------------------

def _safe_str(value) -> str:
    """Devuelve el valor como cadena limpia o 'No disponible' si está ausente."""
    if value is None:
        return "No disponible"
    s = str(value).strip()
    return s if s not in ("", "nan", "NaT", "None") else "No disponible"


def _safe_float(value) -> float:
    """Convierte a float; devuelve 0.0 si no es posible."""
    try:
        return float(str(value).strip().replace(",", "."))
    except (TypeError, ValueError):
        return 0.0


def _clasificar_valor(valor: float) -> str:
    """Clasifica un contrato según su valor numérico."""
    if valor < UMBRAL_BAJO:
        return "Bajo"
    elif valor <= UMBRAL_MEDIO:
        return "Medio"
    else:
        return "Alto"


def _clasificar_estado(estado: str) -> str:
    """Clasifica el estado del procedimiento."""
    estado_lower = estado.lower()
    if estado_lower == "adjudicado":
        return "Adjudicado"
    elif estado_lower == "no adjudicado":
        return "No adjudicado"
    else:
        return "Otro estado"


def process_records(raw: list[dict]) -> list[dict]:
    """Procesa la lista cruda y devuelve registros normalizados."""
    procesados = []
    for item in raw:
        entidad = _safe_str(item.get("entidad"))
        proveedor = _safe_str(item.get("nombre_del_proveedor"))
        estado_raw = _safe_str(item.get("estado_del_procedimiento"))
        valor = _safe_float(item.get("valor_total_adjudicacion"))

        procesados.append({
            "entidad": entidad,
            "nombre_del_proveedor": proveedor,
            "valor_total_adjudicacion": valor,
            "estado_del_procedimiento": estado_raw,
            "categoria_valor": _clasificar_valor(valor),
            "categoria_estado": _clasificar_estado(estado_raw),
        })
    return procesados


# ---------------------------------------------------------------------------
# Presentación de resultados
# ---------------------------------------------------------------------------

def mostrar_resultados(contratos: list[dict]) -> None:
    """Muestra en pantalla todos los resultados requeridos."""

    sep = "=" * 65
    sep_minor = "-" * 65

    print(f"\n{sep}")
    print("  QUIZ #2 AVANZADO – EQUIPO 2")
    print(f"  Fuente: {API_URL}?$limit={LIMIT}&$offset={OFFSET}")
    print(sep)

    # 1. Total de contratos procesados
    total = len(contratos)
    print(f"\n1. Total de contratos procesados : {total}")

    # 2. Suma total de valores
    suma_total = sum(c["valor_total_adjudicacion"] for c in contratos)
    print(f"2. Suma total de valores          : ${suma_total:,.2f}")

    # 3. Promedio (solo valores > 0)
    valores_validos = [c["valor_total_adjudicacion"] for c in contratos if c["valor_total_adjudicacion"] > 0]
    n_validos = len(valores_validos)
    promedio = sum(valores_validos) / n_validos if n_validos > 0 else 0.0
    print(f"3. Promedio (valores > 0)         : ${promedio:,.2f}  ({n_validos} contratos con valor válido)")

    # 4. Contratos por categoría de valor
    print(f"\n4. Contratos por categoría de valor:")
    print(f"   {sep_minor}")
    for cat in ("Bajo", "Medio", "Alto"):
        n = sum(1 for c in contratos if c["categoria_valor"] == cat)
        print(f"   {'  ' + cat:<15}: {n:>6}")

    # 5. Contratos por estado
    print(f"\n5. Contratos por estado:")
    print(f"   {sep_minor}")
    for estado in ("Adjudicado", "No adjudicado", "Otro estado"):
        n = sum(1 for c in contratos if c["categoria_estado"] == estado)
        print(f"   {' ' + estado:<22}: {n:>6}")

    # 6. Contratos con valor 0
    con_valor_cero = sum(1 for c in contratos if c["valor_total_adjudicacion"] == 0)
    print(f"\n6. Contratos con valor = 0        : {con_valor_cero}")

    # 7. Contratos con valor > 1.000.000.000
    grandes = [c for c in contratos if c["valor_total_adjudicacion"] > UMBRAL_ALTO_ESPECIAL]
    print(f"\n7. Contratos con valor > $1.000.000.000 ({len(grandes)} encontrados):")
    if grandes:
        print(f"   {'#':<5} {'Valor':>20}  {'Proveedor'}")
        print(f"   {sep_minor}")
        for i, c in enumerate(grandes, 1):
            proveedor = c["nombre_del_proveedor"][:50]
            entidad = c["entidad"][:40]
            print(f"   {i:<5} ${c['valor_total_adjudicacion']:>19,.2f}  {proveedor}")
            print(f"         Entidad: {entidad}")
            print(f"         Estado : {c['estado_del_procedimiento']}")
    else:
        print("   (ninguno)")

    # 8. Contratos con valor > 200.000.000 y estado ≠ "Adjudicado"
    no_adj_altos = [
        c for c in contratos
        if c["valor_total_adjudicacion"] > UMBRAL_MEDIO
        and c["categoria_estado"] != "Adjudicado"
    ]
    print(f"\n8. Contratos con valor > $200.000.000 y estado ≠ Adjudicado ({len(no_adj_altos)} encontrados):")
    if no_adj_altos:
        print(f"   {'#':<5} {'Valor':>20}  {'Estado':<25} {'Proveedor'}")
        print(f"   {sep_minor}")
        for i, c in enumerate(no_adj_altos, 1):
            proveedor = c["nombre_del_proveedor"][:40]
            estado = c["estado_del_procedimiento"][:24]
            print(f"   {i:<5} ${c['valor_total_adjudicacion']:>19,.2f}  {estado:<25} {proveedor}")
    else:
        print("   (ninguno)")

    print(f"\n{sep}\n")


# ---------------------------------------------------------------------------
# Punto de entrada
# ---------------------------------------------------------------------------

def main():
    print("Descargando datos del Equipo 2 desde datos.gov.co …")
    raw = fetch_data()
    print(f"  {len(raw)} registros descargados.")

    contratos = process_records(raw)
    mostrar_resultados(contratos)


if __name__ == "__main__":
    main()
