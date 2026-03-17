# API-gobierno

Proyecto de analisis de datos con:

1. `quiz2.py` para procesar 2000 contratos del dataset asignado.
2. Backend FastAPI con PostgreSQL para exponer datos de IPS.
3. Frontend React + Vite para dashboard y exploracion.

## 1. Requisitos

1. Python 3.11+
2. PostgreSQL 14+
3. Node.js 18+

## 2. Clonar el proyecto

```bash
git clone https://github.com/andres-lopez-g/API-gobierno.git
cd API-gobierno
```

## 3. Configuracion de base de datos (PostgreSQL)

Credenciales por defecto usadas en `config.py`:

1. Base de datos: `api_gobierno`
2. Usuario: `postgres`
3. Clave: `admin`
4. Host: `localhost`
5. Puerto: `5432`

Crear la base:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE api_gobierno"
```

Si necesitas ajustar credenciales, puedes usar variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) o editar `config.py`.

## 4. Instalar dependencias de Python

```bash
pip install -r requirements.txt
```

## 5. Cargar datos en PostgreSQL

```bash
python extractor.py --truncate
```

Este comando:

1. Crea base y tabla si no existen.
2. Descarga datos del dataset IPS (`ugc5-acjp`).
3. Inserta registros en `api_gobierno.ips`.

## 6. Levantar API backend

```bash
python app.py
```

Endpoints:

1. `http://localhost:5000/health`
2. `http://localhost:5000/docs`

## 7. Levantar frontend

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend en:

1. `http://localhost:5173`

## 8. Ejecutar Quiz 2

```bash
python quiz2.py
```

Nota: el comando correcto incluye extension `.py`.

## 9. Problemas comunes

1. Error `python: can't open file 'quiz2'`: ejecuta `python quiz2.py`.
2. Error de DNS con `datos.gov.co`: verifica internet/DNS y reintenta `python extractor.py --truncate`.
3. Error autenticacion PostgreSQL: revisa usuario/clave (`postgres` / `admin`) y que el servicio este activo.
4. Frontend 404 en `localhost:5173`: asegúrate de correr `npm --prefix frontend run dev`.

## Resumen rapido

```bash
pip install -r requirements.txt
psql -U postgres -h localhost -c "CREATE DATABASE api_gobierno"
python extractor.py --truncate
python app.py
npm --prefix frontend install
npm --prefix frontend run dev
python quiz2.py
```
