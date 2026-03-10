"""
diagnostico.py
Script de diagnóstico para inspeccionar qué datos devuelve la API
de datos.gov.co antes de insertarlos en MySQL.

Uso:
    python diagnostico.py
    python diagnostico.py --limit 5
    python diagnostico.py --url "https://www.datos.gov.co/resource/ksew-j3zj.json"
"""

import argparse
import json
import sys

import requests
import pandas as pd

import config

# ---------------------------------------------------------------------------
# Colores ANSI para consola
# ---------------------------------------------------------------------------
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"


def titulo(texto):
    print(f"\n{BOLD}{CYAN}{'='*60}{RESET}")
    print(f"{BOLD}{CYAN}  {texto}{RESET}")
    print(f"{BOLD}{CYAN}{'='*60}{RESET}")


def ok(texto):    print(f"{GREEN}  ✔ {texto}{RESET}")
def warn(texto):  print(f"{YELLOW}  ⚠ {texto}{RESET}")
def error(texto): print(f"{RED}  ✘ {texto}{RESET}")


# ---------------------------------------------------------------------------
# 1. Conexión con la API
# ---------------------------------------------------------------------------
def check_api(url: str, limit: int):
    titulo("1. CONEXIÓN CON LA API")
    print(f"  URL    : {url}")
    print(f"  Límite : {limit} registros")

    try:
        resp = requests.get(url, timeout=config.API_TIMEOUT)
    except requests.exceptions.ConnectionError:
        error("No se pudo conectar. Verifica tu conexión a internet.")
        sys.exit(1)
    except requests.exceptions.Timeout:
        error(f"Timeout después de {config.API_TIMEOUT}s.")
        sys.exit(1)

    print(f"  HTTP   : {resp.status_code}")

    if not resp.ok:
        error(f"La API respondió con error: {resp.text[:300]}")
        sys.exit(1)

    ok(f"Respuesta HTTP {resp.status_code} OK")

    data = resp.json()

    if not isinstance(data, list):
        warn("La respuesta NO es una lista. Estructura recibida:")
        print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
        sys.exit(1)

    ok(f"La respuesta es una lista con {len(data)} elementos")
    return data


# ---------------------------------------------------------------------------
# 2. Calidad de los registros
# ---------------------------------------------------------------------------
def check_records(data: list, limit: int):
    titulo("2. CALIDAD DE LOS REGISTROS")

    total = len(data)
    vacios = sum(1 for r in data if not r)
    con_datos = total - vacios

    print(f"  Total recibidos : {total}")
    print(f"  Con campos      : {con_datos}  {GREEN if con_datos > 0 else RED}({'%.1f' % (con_datos/total*100)}%){RESET}")
    print(f"  Vacíos ({{}}})    : {vacios}  {RED if vacios > 0 else GREEN}({'%.1f' % (vacios/total*100)}%){RESET}")

    if vacios == total:
        error("TODOS los registros están vacíos. La API no está devolviendo datos en este endpoint.")
        print(f"\n  Sugerencias:")
        print(f"  1. Verifica que la URL del dataset sea correcta en config.py:")
        print(f"     API_URL = \"{config.API_URL}\"")
        print(f"  2. Abre en tu navegador: {config.API_URL}?$limit=1")
        print(f"  3. Consulta en https://www.datos.gov.co el identificador real del dataset.")
        return None

    if vacios > 0:
        warn(f"{vacios} registros vacíos serán ignorados.")

    registros_validos = [r for r in data if r]
    return registros_validos[:limit]


# ---------------------------------------------------------------------------
# 3. Inspección de columnas
# ---------------------------------------------------------------------------
def check_columns(registros: list):
    titulo("3. COLUMNAS DISPONIBLES EN LA API")

    # Unión de todas las claves presentes (pueden variar entre registros)
    todas_claves = set()
    for r in registros:
        todas_claves.update(r.keys())

    print(f"  {len(todas_claves)} columnas encontradas:\n")
    for col in sorted(todas_claves):
        # Muestra un valor de ejemplo
        ejemplo = next((r[col] for r in registros if col in r and r[col]), "—")
        print(f"    {CYAN}{col:<35}{RESET} → {str(ejemplo)[:60]}")

    # Advertir si faltan columnas esperadas por el extractor
    esperadas = {
        "codigoestacion", "codigo_estacion",
        "nombreestacion", "nombre_estacion",
        "departamento",
        "municipio",
        "fecha", "fechaobservacion",
        "valor", "valorobservado", "valor_observado",
        "latitud", "longitud", "altitud",
    }
    faltantes = esperadas - todas_claves
    if faltantes:
        warn(f"Columnas esperadas por extractor.py que NO aparecen en la API:")
        for f in sorted(faltantes):
            print(f"    {YELLOW}  - {f}{RESET}")
    else:
        ok("Todas las columnas esperadas por el extractor están presentes.")

    return todas_claves


# ---------------------------------------------------------------------------
# 4. Muestra de registros
# ---------------------------------------------------------------------------
def show_sample(registros: list, n: int = 3):
    titulo(f"4. MUESTRA DE {min(n, len(registros))} REGISTRO(S)")
    for i, r in enumerate(registros[:n], 1):
        print(f"\n  {BOLD}--- Registro #{i} ---{RESET}")
        for k, v in r.items():
            print(f"    {CYAN}{k:<35}{RESET}: {str(v)[:80]}")


# ---------------------------------------------------------------------------
# 5. Estadísticas con pandas
# ---------------------------------------------------------------------------
def show_stats(registros: list):
    titulo("5. ESTADÍSTICAS GENERALES (pandas)")

    df = pd.DataFrame(registros)
    print(f"\n  Shape: {df.shape[0]} filas × {df.shape[1]} columnas\n")

    resumen = pd.DataFrame({
        "dtype":      df.dtypes.astype(str),
        "no_nulos":   df.count(),
        "nulos":      df.isna().sum(),
        "% lleno":    (df.count() / len(df) * 100).round(1).astype(str) + "%",
        "ejemplo":    df.apply(lambda c: str(c.dropna().iloc[0])[:40] if c.dropna().shape[0] > 0 else "—"),
    })

    print(resumen.to_string())

    # Columnas con más del 80% de nulos
    col_vacias = resumen[resumen["nulos"] / len(df) > 0.8]["nulos"]
    if not col_vacias.empty:
        warn(f"\n  Columnas con >80% de valores nulos: {', '.join(col_vacias.index.tolist())}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Diagnóstico de la API de precipitation.")
    parser.add_argument("--limit", type=int, default=5, help="Registros de muestra a mostrar (default: 5)")
    parser.add_argument("--url",   type=str, default=config.API_URL, help="URL alternativa a probar")
    args = parser.parse_args()

    print(f"\n{BOLD}API-gobierno – Diagnóstico de extracción{RESET}")
    print(f"Fecha/hora: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")

    data      = check_api(args.url, args.limit)
    registros = check_records(data, args.limit)

    if registros is None:
        sys.exit(1)

    check_columns(registros)
    show_sample(registros, n=args.limit)
    show_stats(registros)

    titulo("DIAGNÓSTICO COMPLETADO")
    ok("Revisa los resultados anteriores para ajustar extractor.py o config.py.")


if __name__ == "__main__":
    main()
