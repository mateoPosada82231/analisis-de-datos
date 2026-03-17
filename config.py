"""Configuration settings for API-gobierno using PostgreSQL."""

import os

# External dataset URL (datos.gov.co – IPS Habilitadas)
# Dataset page: https://www.datos.gov.co/Salud-y-Protecci-n-Social/IPS-Habilitadas/ugc5-acjp
API_URL = "https://datos.gov.co/resource/ugc5-acjp.json"
API_LIMIT = 5000  # max records to fetch per request

# PostgreSQL connection settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
DB_NAME = os.getenv("DB_NAME", "api_gobierno")

API_TIMEOUT = 30  # seconds for HTTP requests to datos.gov.co

# API server settings (uvicorn)
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "5000"))
API_RELOAD = os.getenv("API_RELOAD", "false").lower() == "true"
